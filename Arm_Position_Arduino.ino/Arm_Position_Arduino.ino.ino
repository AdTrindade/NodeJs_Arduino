//Adriano Trindade 
//e-mail  adtrin@hotmail.com
//El proyecto consiste, en enviar la inclinacion del brazo + posicion, para un display LCD de 2 lineas 16 columnas usando formato JSON y tambien
//por el puerto serial, siendo ese ultimo, para la computadora que va graficar eso en una pantalla las coordinadas XY + Inclinacion.

#include <MPU9250_WE.h> //https://www.arduino.cc/reference/en/libraries/mpu9250_we/
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>
#define mitad_velocid_ar 0.017 // Velocidade do som / 2

#define ultraS1out 2  // Saida ultrasom 1
#define ultraS1in  3 // Entrada ultrasom 1
#define ultraS2out 8
#define ultraS2in  9
#define baudrate 57200 
#define LCD      0x27
#define MPU      0x68
#define linhas      2
#define coluna    16

MPU9250_WE mpu = MPU9250_WE(MPU);
LiquidCrystal_I2C lcd(LCD,coluna,linhas); //Para Display I2C 

float c_X,c_Y; //tiempo que demora en llegar el eco
float t,distancia ;
float angulos;

/*######################################################################################################################################################*/

float XY (const int Trigger, const int Echo)
{
  digitalWrite(Trigger, LOW);
  delayMicroseconds(10);          //Enviamos un pulso de 10us
  digitalWrite(Trigger, HIGH);
  delayMicroseconds(10);
  t = pulseIn(Echo, HIGH); //obtenemos el ancho del pulso
  distancia =  t * mitad_velocid_ar ;
  return distancia;  
}
 
void setup()
{
 
lcd.init(); 
lcd.backlight();
Wire.begin();

if(!mpu.init()){
    Serial.println("mpu9250 nao responde");
  }
if(!mpu.initMagnetometer()){
    Serial.println("Magnetometro nao responde");
  }

  mpu.autoOffsets();
  mpu.enableGyrDLPF();
  mpu.setGyrDLPF(MPU9250_DLPF_6);
  mpu.setSampleRateDivider(5);
  mpu.setGyrRange(MPU9250_GYRO_RANGE_250);
  mpu.setAccRange(MPU9250_ACC_RANGE_2G);
  mpu.enableAccDLPF(true);
  mpu.setAccDLPF(MPU9250_DLPF_6);
  mpu.setMagOpMode(AK8963_CONT_MODE_8HZ);
  delay(100);

/*********************************/
pinMode(ultraS1out, OUTPUT);///Trigger
pinMode(ultraS1in, INPUT);//Echo
pinMode(ultraS2out, OUTPUT);///Trigger
pinMode(ultraS2in, INPUT);//Echo 
digitalWrite(ultraS1out, LOW);
digitalWrite(ultraS2out, LOW);
  
Serial.begin(baudrate);
while(!Serial) {} 
}


///////////////////////////////////////////////////////////////////////////////////////////////////
//CALCULOS DE ANGULOS CONFORME COORDINADAS Y ENVIO DE LAS COORDINADAS DE LOS SENSORES DE DISTANCIA 
///////////////////////////////////////////////////////////////////////////////////////////////////

void loop()
{
StaticJsonDocument<512> jobj;
xyzFloat Acel       =   mpu.getGValues();
xyzFloat Gyroscop    =   mpu.getGyrValues();
xyzFloat Magneto     =   mpu.getMagValues();
float    Temperatura =   mpu.getTemperature();

//algoritimo https://gist.github.com/shoebahmedadeel/0d8ca4eaa65664492cf1db2ab3a9e572
float pitch = atan2 (Acel.y ,( sqrt ((Acel.x * Acel.x) + (Acel.z * Acel.z))));
float roll = atan2(-Acel.x ,( sqrt((Acel.y * Acel.y) + (Acel.z * Acel.z))));
float anguloY = (Magneto.y * cos(roll)) - (Magneto.z * sin(roll));
float anguloX = (Magneto.x * cos(pitch))+(Magneto.y * sin(roll)*sin(pitch))+(Magneto.z * cos(roll) * sin(pitch));
float yaw = atan2(anguloX,anguloY);


//--------------------------------------------------------------//   
  //ESTRUTURA DE PARA ENVIO DE LOS ANGULOS PARA EL PUERTO SERIAL  
//--------------------------------------------------------------//   
c_X  =    XY(ultraS1out,ultraS1in)   ;
c_Y  =    XY(ultraS2out,ultraS2in)   ;
jobj["ultraX"]      =   c_X          ;
jobj["ultraY"]      =   c_Y          ;
jobj["Acel_X"]      =   Acel.x       ;
jobj["Acel_Y"]      =   Acel.y       ;
jobj["Acel_Z"]      =   Acel.z       ; 
jobj["Gyros_X"]     =   Gyroscop.x   ;
jobj["Gyros_Y"]     =   Gyroscop.y   ;
jobj["Gyros_Z"]     =   Gyroscop.z   ;
jobj["Magnet_X"]    =   Magneto.x    ;
jobj["Magnet_Y"]    =   Magneto.y    ;
jobj["Magnet_Z"]    =   Magneto.z    ;
jobj["yaw"]         =   yaw          ;
jobj["pitch"]       =   pitch        ;
jobj["roll"]        =   roll         ;
jobj["Temperatura"] = Temperatura    ;

serializeJson(jobj,Serial);
Serial.print("\n");
Serial.print("\r");
//----------------------------  
//MUESTRO LOS VALORES EN EL DISPLAY COMO REFERENCIA DE PRUEBA
   lcd.setCursor(0, 0);
   lcd.print("YW");  
   lcd.print(yaw ,2);
   lcd.setCursor(0, 1);
   lcd.print("Pch");
   lcd.print(pitch ,2);
   lcd.setCursor(9,1);
   lcd.print("Rol");
   lcd.print(roll,1);
   lcd.setCursor(8,1);
   delay(250); 
}
