const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// canvas konfiguratsiyasi
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// face-api.js modellarini yuklash
const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

// Modellarni yuklash funksiyasi
async function loadModels() {
  const modelPath = path.join(__dirname, '../', 'ai-models'); // Model fayllari joylashgan papka
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  console.log('Modellar yuklandi');
}

// Rasmdan yuzni tahlil qilish funksiyasi
async function detectFaceFun(imageBuffer) {
  const img = await canvas.loadImage(imageBuffer);
  console.log(img);
  
  const detection = await faceapi.detectSingleFace(img, faceDetectionOptions).withFaceLandmarks().withFaceDescriptor();
  return detection;
}

module.exports = { loadModels, detectFaceFun, faceDetectionNet, faceDetectionOptions };
