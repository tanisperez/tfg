/**
 * Código fuente de la estación meteorológica.
 * Estanislao R. Pérez Nartallo
 *
 * Este código es Software Libre bajo la licencia GPLv3 (ver archivo LICENSE).
 */
#include <Adafruit_CC3000.h>
#include <Adafruit_BMP085.h>
#include <DHT.h>
#include <Wire.h>
#include <SPI.h>
#include <Base64.h>
#include <avr/sleep.h>
#include <avr/power.h>
#include <avr/wdt.h>
#include <jsmn.h>
#include <EEPROM.h>

#define EEPROM_SETTINGS_ADDRESS      0x00
//#define EDIT_EEPROM
//Enable EDIT_EEPROM to edit the EEPROM settings values.

#ifdef EDIT_EEPROM
  #define WIFI              "tfg"
  #define WIFI_PASSWORD     "zonazona"
  #define REST_IP           "192.168.0.100"
  #define REST_PORT         3000
  #define SAMPLES_INTERVAL  16
#endif

#define SERIAL_DEBUG

#ifdef SERIAL_DEBUG 
  #include "utility/debug.h"
  
  #define DEBUGPRINT(__s)  Serial.print(__s)
  #define DEBUGPRINTLN(__s)  Serial.println(__s)
  #define DEBUGPRINT_F(__s)  Serial.print(F(__s))
  #define DEBUGPRINTLN_F(__s)  Serial.println(F(__s))
#else
  #define DEBUGPRINT(__s)  /* Do nothing */
  #define DEBUGPRINTLN(__s)
  #define DEBUGPRINT_F(__s)  
  #define DEBUGPRINTLN_F(__s)
#endif

// These are the interrupt and control pins
#define ADAFRUIT_CC3000_IRQ   3  // MUST be an interrupt pin!
// These can be any two pins
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10

#define DHTPIN        2 // Pin connected
#define DHTTYPE       DHT22 // DHT22 (AM2302)

/* Length constants */
#define MAC_LEN                   12
#define AUTHORIZATION_HEADER_LEN  57 //strlen("Authorization: Basic ") + base64(user:password)
#define WIFI_LEN                  10
#define WIFI_PASSWORD_LEN         12
#define IP_LEN                    15

#define LED_PIN        6

char macAddress[MAC_LEN + 1];
char authorizationHeader[AUTHORIZATION_HEADER_LEN + 1];

/* Settings */
typedef struct settings {
  char wifi[WIFI_LEN + 1];
  char wifiPassword[WIFI_PASSWORD_LEN + 1];
  char restIP[IP_LEN + 1];
  uint16_t restPort;
  uint16_t samplesInterval;
} settings_t;
settings_t settings;

// Sleep time in seconds, must be multiple of 8 
unsigned int sleepIterations, maxSleepIterations;
volatile bool watchdogActivated = true;

/* Definitions */
void monitor();
void postSamples(Adafruit_CC3000 &cc3000);
void getStationInfo(Adafruit_CC3000 &cc3000, settings_t * newSettings);
int jsoneq(const char *json, jsmntok_t *tok, const char *s);
void readTemperatureAndHumidity(float * temperature, float * humidity);
uint32_t readPressure();
void sleep();
void reverseStr(char * str);
void getMACAddress(Adafruit_CC3000 &cc3000);
uint32_t strToIP(char * ip);
void fail();

/**
 * Watchdog Timer Interrupt
 */
ISR(WDT_vect)
{
  // Set the watchdog activated flag.
  watchdogActivated = true;
}

/**
 * Setup procedure
 */
void setup(void)
{
  #ifdef SERIAL_DEBUG
    Serial.begin(115200);
  #endif
  
  //DEBUGPRINT_F("Free RAM: "); DEBUGPRINTLN(getFreeRam());
  
  #ifdef EDIT_EEPROM
    DEBUGPRINTLN_F("Starting station in EEPROM edit mode...");
    DEBUGPRINTLN_F("Writing news settings in flash memory..."); 
  
    settings_t newSettings;
    strncpy(newSettings.wifi, WIFI, WIFI_LEN + 1);
    strncpy(newSettings.wifiPassword, WIFI_PASSWORD, WIFI_PASSWORD_LEN + 1);
    strncpy(newSettings.restIP, REST_IP, IP_LEN + 1);
    newSettings.restPort = REST_PORT;
    newSettings.samplesInterval = SAMPLES_INTERVAL;
    EEPROM.put(EEPROM_SETTINGS_ADDRESS, newSettings);
    
    delay(500);
    DEBUGPRINTLN_F("Done!");
    DEBUGPRINTLN_F("Please, disable the flag #EDIT_EEPROM and recompile the source to start normally.");
    fail(); /* It's not a fail, blinks indefinitely */
  #endif
  pinMode(LED_PIN, OUTPUT);

  /* Read settings from EEPROM memory */
  EEPROM.get(EEPROM_SETTINGS_ADDRESS, settings);
  
  /* Set these variables to the value limit for send data on power on  */
  sleepIterations = settings.samplesInterval >> 3;
  maxSleepIterations = sleepIterations;
  
  // Setup the watchdog timer to run an interrupt which
  // wakes the Arduino from sleep every 8 seconds.
  
  // Note that the default behavior of resetting the Arduino
  // with the watchdog will be disabled.
  
  // This next section of code is timing critical, so interrupts are disabled.
  // See more details of how to change the watchdog in the ATmega328P datasheet
  // around page 50, Watchdog Timer.
  noInterrupts();
  
  // Set the watchdog reset bit in the MCU status register to 0.
  MCUSR &= ~(1<<WDRF);
  
  // Set WDCE and WDE bits in the watchdog control register.
  WDTCSR |= (1<<WDCE) | (1<<WDE);

  // Set watchdog clock prescaler bits to a value of 8 seconds.
  WDTCSR = (1<<WDP0) | (1<<WDP3);
  
  // Enable watchdog as interrupt only (no reset).
  WDTCSR |= (1<<WDIE);
  
  // Enable interrupts again.
  interrupts();
}

/**
 * Loop procedure
 */
void loop(void)
{
  if (watchdogActivated)
  {
    watchdogActivated = false;
    // Increase the count of sleep iterations and take a sensor
    // reading once the max number of iterations has been hit.
    if (++sleepIterations >= maxSleepIterations) {
      // Reset the number of sleep iterations.
      sleepIterations = 0;
      // Log the sensor data (waking the CC3000, etc. as needed)
      DEBUGPRINTLN_F("\nWaking up!");
      monitor();
      DEBUGPRINT_F("Sleeping for "); DEBUGPRINT(settings.samplesInterval); DEBUGPRINTLN_F(" seconds!");
      delay(200);
      wdt_reset();
    }
  }
  
  sleep();
}

/**
 * Monitor function
 */
void monitor()
{
  digitalWrite(LED_PIN, HIGH);
 
  Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT,
                                         SPI_CLOCK_DIVIDER); // you can change this clock speed but DI
  
  if (!cc3000.begin())
    fail(); //Unable to initialise the CC3000! Check your wiring?
    
  getMACAddress(cc3000);
  getAuthorization();
     
  /* Delete any old connection data on the module */
  if (!cc3000.deleteProfiles())
    fail(); //Unable to delete profiles!
 
  /* Attempt to connect to an access point */
  if (cc3000.connectToAP(settings.wifi, settings.wifiPassword, WLAN_SEC_WPA2)) {  
      /* Wait for DHCP to complete */
    while(!cc3000.checkDHCP())
    {
      delay(100); // ToDo: Insert a DHCP timeout!
      // INSERT TIMEOUT!
      // If fails, set static IP!!
    }  
    
    DEBUGPRINTLN_F("Posting samples...");
    postSamples(cc3000);
    DEBUGPRINTLN_F("Getting station settings...");
    getStationInfo(cc3000);
  } else
    DEBUGPRINTLN_F("Couldn\'t connect to the AP");
  
  /* You need to make sure to clean up after yourself or the CC3000 can freak out */
  /* the next time you try to connect ... */
  if (cc3000.checkConnected()) {
    cc3000.disconnect();
  }
  /* Shut down the CC3000 */
  cc3000.stop();
  
  digitalWrite(LED_PIN, LOW);
}

/**
 * Send a POST request to the server with the sensor values.
 */
void postSamples(Adafruit_CC3000 &cc3000)
{
  uint32_t pressure = readPressure();
  float temperature, humidity;
  readTemperatureAndHumidity(&temperature, &humidity);
  char request[140];
  char t[8];
  char h[8];
  dtostrf(temperature, 1, 2, t);
  dtostrf(humidity, 1, 2, h);

  sprintf(request, "{\"MAC\":\"%s\",\"samples\":[{\"pressure\":%lu,\"temperature\":", macAddress, pressure);
  strcat(request, t);
  strcat(request, ",\"humidity\":");
  strcat(request, h);
  strcat(request, "}]}");
  
  Adafruit_CC3000_Client www = cc3000.connectTCP(strToIP(settings.restIP), (uint16_t)settings.restPort);
  if (www.connected()) {
    www.fastrprint(F("POST /v1/stations/")); www.fastrprint(macAddress); www.fastrprint(F("/data"));
    www.fastrprintln(F(" HTTP/1.0"));
    www.fastrprintln(authorizationHeader);
    www.fastrprintln(F("content-type: application/json"));
    www.fastrprint(F("content-length: ")); www.println(strlen(request));
    www.fastrprint("\r\n"); www.fastrprint(request);
  
    unsigned long lastRead = millis();
    while (www.connected() && (millis() - lastRead < 2000)) {
      while (www.available()) {
        char c = www.read();
        //Serial.print(c);
        lastRead = millis();
      }
    }
    //Serial.println("");
    
    www.close();
  } else {
    DEBUGPRINTLN("Connection error!");  
  }
}

/**
 * Send a GET request to the server to retrieve the weather monitoring system settings.
 */
void getStationInfo(Adafruit_CC3000 &cc3000)
{
  Adafruit_CC3000_Client www = cc3000.connectTCP(strToIP(settings.restIP), (uint16_t)settings.restPort);
  if (www.connected()) {    
    www.fastrprint(F("GET /v1/stations/")); www.fastrprint(macAddress);
    www.fastrprintln(F(" HTTP/1.0"));
    www.fastrprintln(authorizationHeader);
    www.println();
     
    char json[200];
    unsigned int pos = 0;
    unsigned long lastRead = millis();
    while (www.connected() && (millis() - lastRead < 2000)) {
      while (www.available()) {
        if (pos > 10 && json[pos-1] == '\n' && json[pos - 2] == '\r' && json[pos - 3] == '\n' && json[pos - 4] == '\r')
          pos = 0;
        json[pos++] = www.read();
        lastRead = millis();
      }
    }
    json[pos] = '\0';
    Serial.println(json);
  
    www.close();
    
    int r;
    jsmn_parser p;
    jsmntok_t t[14]; // We expect no more than 14 tokens

    jsmn_init(&p);
    r = jsmn_parse(&p, json, strlen(json), t, sizeof(t)/sizeof(t[0]));
    char temp[24];
    bool newSettings = false;
    for (int i = 1; i < r; i++) {
        if (jsoneq(json, &t[i], "wifi") == 0) {
          strncpy(temp, json + t[i+1].start, t[i+1].end-t[i+1].start);
          temp[t[i+1].end-t[i+1].start] = '\0';
          if (strncmp(settings.wifi, temp, sizeof(settings.wifi)) != 0) {
            strncpy(settings.wifi, temp, sizeof(settings.wifi));
            DEBUGPRINTLN_F("Wifi modified!");
            newSettings = true;
          }
	  i++;
	}
        else if (jsoneq(json, &t[i], "wifiPassword") == 0) {
          strncpy(temp, json + t[i+1].start, t[i+1].end-t[i+1].start);
          temp[t[i+1].end-t[i+1].start] = '\0';
          if (strncmp(settings.wifiPassword, temp, sizeof(settings.wifiPassword)) != 0) {
            strncpy(settings.wifiPassword, temp, sizeof(settings.wifiPassword));
            DEBUGPRINTLN_F("wifiPassword modified!");
            newSettings = true;
          }
	  i++;
	}
        else if (jsoneq(json, &t[i], "ip") == 0) {
          strncpy(temp, json + t[i+1].start, t[i+1].end-t[i+1].start);
          temp[t[i+1].end-t[i+1].start] = '\0';
          if (strncmp(settings.restIP, temp, sizeof(settings.restIP)) != 0) {
            strncpy(settings.restIP, temp, sizeof(settings.restIP));
            DEBUGPRINTLN_F("restIP modified!");
            newSettings = true;
          }
	  i++;
	}
        else if (jsoneq(json, &t[i], "port") == 0) {
          strncpy(temp, json + t[i+1].start, t[i+1].end-t[i+1].start);
          temp[t[i+1].end-t[i+1].start] = '\0';
          pos = strtol(temp, NULL, 10);
          if (settings.restPort != pos) {
            settings.restPort = pos;
            DEBUGPRINTLN_F("restPort modified!");
            newSettings = true;
          }
	  i++;
	}
        else if (jsoneq(json, &t[i], "interval") == 0) {
          strncpy(temp, json + t[i+1].start, t[i+1].end-t[i+1].start);
          temp[t[i+1].end-t[i+1].start] = '\0';
          pos = strtol(temp, NULL, 10);
          if (settings.samplesInterval != pos) {
            settings.samplesInterval = pos;
            sleepIterations = settings.samplesInterval >> 3;
            maxSleepIterations = sleepIterations;
            DEBUGPRINTLN_F("samplesInterval modified!");
            newSettings = true;
          }
	  i++;
	}
    } 
    
    if (newSettings)
      EEPROM.put(EEPROM_SETTINGS_ADDRESS, settings);
  }  else {
    DEBUGPRINTLN("Connection error!");  
  }
}

/**
 * Find a JSON field name in the JSON string.
 * @parans json        JSON string.
 * @params tok         Array of jsmntok_t structs to store JSON items.
 * @params s           JSON field name to find.
 */
int jsoneq(const char *json, jsmntok_t *tok, const char *s) 
{
  if (tok->type == JSMN_STRING && (int) strlen(s) == tok->end - tok->start &&
      strncmp(json + tok->start, s, tok->end - tok->start) == 0) {
	return 0;
  }
	return -1;
}

/**
 * Read the temperature and humidity from the DHT22 sensor.
 * @params  temperature      Out value of the temperature.
 * @params  humidity         Out value of the humidity level. 
 */
void readTemperatureAndHumidity(float * temperature, float * humidity)
{
  DHT dht(DHTPIN, DHTTYPE);
  dht.begin();
  *temperature = dht.readTemperature();
  *humidity = dht.readHumidity();
}

/**
 * Read Atmospheric pressure using the BMP180 sensor.
 * @returns    A unsigned 32 bit integer with the atmospheric pressure value.
 */
uint32_t readPressure()
{
  Adafruit_BMP085 bmp;
  if (!bmp.begin())
    fail(); //Could not find a valid BMP085 sensor, check wiring!

  return bmp.readPressure(); 
}

/**
 * Enter in deepest sleep mode: SLEEP_MODE_PWR_DOWN.
 */
void sleep()
{
  // Set sleep to full power down.  Only external interrupts or 
  // the watchdog timer can wake the CPU!
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);

  // Turn off the ADC while asleep.
  power_adc_disable();
  sleep_enable();
  // Enable sleep and enter sleep mode.
  sleep_mode();

  // CPU is now asleep and program execution completely halts!
  // Once awake, execution will resume at this point.
  
  // When awake, disable sleep mode and turn on all devices.
  sleep_disable();
  power_all_enable();
}

/**
 * Reverse the string passed by param.
 * @param  str    String to be reversed.
 */
void reverseStr(char * str)
{
  int len = strlen(str);
  int limit = len >> 1;
  char temp;
  for (int i = 0; i < limit; i++) {
    temp = str[i];
    str[i] = str[len - 1 - i];
    str[len -1 - i] = temp;
  }
}

/**
 * Get the MAC Address from the CC3000 board.
 * Store the result in the global variable "macAddress".
 */
void getMACAddress(Adafruit_CC3000 &cc3000)
{
  uint8_t mac[6];
  
  if(!cc3000.getMacAddress(mac))
    fail(); //Unable to retrieve MAC Address!
  else
    sprintf(macAddress, "%02X%02X%02X%02X%02X%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
}

/**
 * Generate the Authorization header for the station. The Authorization header has the format:
 *   Authorization: Basic user:password
 * The string "user:password" is encoded using a base64 cipher.
 * This task has a big complexity, for this reason, this function is executed just once at time, at the beggining
 * of the start up process.
 * The result is stored in the global variable "authorizationHeader".
 */
void getAuthorization()
{
  char password[MAC_LEN + 1];
  char login[MAC_LEN * 2 + 1]; // MAC_LEN * 2 + : (No NULL character!)
  
  strncpy(password, macAddress, MAC_LEN);
  reverseStr(password);
  sprintf(login, "%s:%s", macAddress, password);
  
  int inputLen = sizeof(login);
  int encodedLen = base64_enc_len(inputLen);
  char encodedLogin[encodedLen];
  base64_encode(encodedLogin, login, inputLen);
  
  sprintf(authorizationHeader, "Authorization: Basic %s", encodedLogin);
}

/**
 * Translate a IP address given by a String with the format 0-255.0-255.0-255.0-255 to
 * a unsigned 32 bit number.
 * @param  ip    IP Address as String.
 * @returns      IP Address encoded as unsigned 32 bit number.
 */
uint32_t strToIP(char * ip)
{
  uint32_t u32_ip;
  unsigned char value[4] = {0};
  size_t index = 0;
  while (*ip) {
    if (isdigit((unsigned char)*ip)) {
      value[index] *= 10;
      value[index] += *ip - '0';
    } else {
      index++;
    }
    ip++;
  }
  u32_ip = (uint32_t)value[3];
  u32_ip |= (uint32_t)value[2] << 8;   
  u32_ip |= (uint32_t)value[1] << 16;
  u32_ip |= (uint32_t)value[0] << 24;

  return u32_ip;
}

/**
 * Fail function to handle the exceptions.
 * Just blinks indefinitely.
 */
void fail()
{
  while(1) {
    digitalWrite(LED_PIN, HIGH);
    delay(250);
    digitalWrite(LED_PIN, LOW);
    delay(250);
  } 
}

