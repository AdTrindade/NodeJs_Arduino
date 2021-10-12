//Interface de comunicacao Serial COM 1 (Linux)
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static(__dirname +'/public')); 
 
server.listen(5000,function(){
    console.log('Servidor escutando na porta 5000');
});

const SerialPort = require('serialport');
const { delimiter } = require('path');
const { json } = require('express');
const LeSerial = SerialPort.parsers.Readline;
const serial = new SerialPort('/dev/ttyACM1', {
    baudRate: 57200
});

try {
serial.on('open', function () {
    console.log('Conexao exitosa');
}); 

} catch
{
    console.log('Conexao com a serial com problemas, verifique o cabo');
}

const parser = serial.pipe(new LeSerial({delimiter: '\n\r'}));
//const parser = serial.pipe(new LeSerial());

parser.on('data', function (data) {
    let recebe = data;
    
    try
    {
       
        filtra = JSON.parse(recebe);
        io.emit('coordenadas', filtra);
        
    }
    catch(err)
    {        
           console.log('Cadeia de caracteres cortada');
    }


});




