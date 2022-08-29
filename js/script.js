import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";

const mpHands = window;
const drawingUtils = window;
const controls = window;
const controls3d = window;
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([
  {client: 'Chrome'},
]);

function testSupport(supportedDevices)
{
  const deviceDetector = new DeviceDetector();
  const detectedDevice = deviceDetector.parse(navigator.userAgent);
  let isSupported = false;
  for (const device of supportedDevices) {
    if (device.client !== undefined) {
      const re = new RegExp(`^${device.client}$`);
      if (!re.test(detectedDevice.client.name)) {
        continue;
      }
    }
    if (device.os !== undefined) {
      const re = new RegExp(`^${device.os}$`);
      if (!re.test(detectedDevice.os.name)) {
        continue;
      }
    }
    isSupported = true;
    break;
  }
  if (!isSupported) {
    alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
      `is not well supported at this time, continue at your own risk.`);
  }
}

//Andy
const handPos = document.getElementById('xpos-text');

let isInsideD1 = false;
let isInsideB1 = false;
let isInsideC1 = false;
let isInsideM1 = false;


let isTouching = false;

//


// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
const config = {
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}/${file}`;
  }
};
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const grid = new controls3d.LandmarkGrid(landmarkContainer, {
  connectionColor: 0xCCCCCC,
  definedColors: [{name: 'Left', value: 0xffa500}, {name: 'Right', value: 0x00ffff}],
  range: 0.2,
  fitToGrid: false,
  labelSuffix: 'm',
  landmarkSize: 2,
  numCellsPerAxis: 4,
  showHidden: false,
  centered: false,
});

function onResults(results)
{
  // Hide the spinner.
  document.body.classList.add('loaded');
  // Update the frame rate.
  fpsControl.tick();
  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  var indexTipPos;
  var indexDipPos;
  var indexPipPos;

  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];

      indexTipPos = landmarks[8]
      indexDipPos = landmarks[7]
      indexPipPos = landmarks[6]

      // console.log(landmarks[8].x)
      handPos.innerText = "X:" + landmarks[8].x;
      handPos.innerText += " \nY:" + landmarks[8].y;
      handPos.innerText += " \nZ:" + landmarks[8].z;
      handPos.innerText += " \nZ Dip:" + landmarks[7].z;


      drawingUtils.drawConnectors(canvasCtx, landmarks, mpHands.HAND_CONNECTIONS, {color: isRightHand ? '#035ee8' : '#9700cc'});
      drawingUtils.drawLandmarks(canvasCtx, landmarks, {
        color: isRightHand ? '#035ee8' : '#9700cc',
        fillColor: isRightHand ? '#9700cc' : '#035ee8',
        radius: (data) => {
          return drawingUtils.lerp(data.from.z, -0.15, .1, 10, 1);
        }
      });
    }
  }

  //element= document.getElementById("D1"),

  isInsideD1 = isInside("D1", indexTipPos)
  isInsideB1 = isInside("B1", indexTipPos)
  isInsideC1 = isInside("C1", indexTipPos)
  isInsideM1 = isInside("M1", indexTipPos)


  //*********************************************TOUCH*************************************************
  //*********************************************TOUCH*************************************************
  //*********************************************TOUCH*************************************************
  //*********************************************TOUCH*************************************************
  //*********************************************TOUCH*************************************************
  //*********************************************TOUCH*************************************************
  //******************************touch**************************************************

  try {
    var disTipDip = getDistance(indexTipPos.x, indexTipPos.y, indexTipPos.z, indexDipPos.x, indexDipPos.y, indexDipPos.z)
    var disDipPip = getDistance(indexDipPos.x, indexDipPos.y, indexDipPos.z, indexPipPos.x, indexPipPos.y, indexPipPos.z)


    if (disTipDip < disDipPip * 0.5) {
      if (isInsideD1 && !isTouching) {
        playSample("D1")

      }

      if (isInsideB1 && !isTouching) {
        playSample("B1")

      }

      if (isInsideC1 && !isTouching) {
        playSample("C1")

      }

      if (isInsideM1 && !isTouching) {
        playSample("M1")

      }

      isTouching = true
    } else {
      isTouching = false
    }


  } catch
    (e) {

  }

  function getDistance(x1, y1, z1, x2, y2, z2)
  {
    let y = x2 - x1;
    let x = y2 - y1;
    let z = z2 - z1;

    return Math.sqrt(x * x + y * y + z * z);
  }

  //********************************


  canvasCtx.restore();
  if (results.multiHandWorldLandmarks) {
    // We only get to call updateLandmarks once, so we need to cook the data to
    // fit. The landmarks just merge, but the connections need to be offset.
    const landmarks = results.multiHandWorldLandmarks.reduce((prev, current) => [...prev, ...current], []);
    const colors = [];
    let connections = [];
    for (let loop = 0; loop < results.multiHandWorldLandmarks.length; ++loop) {
      const offset = loop * mpHands.HAND_CONNECTIONS.length;
      const offsetConnections = mpHands.HAND_CONNECTIONS.map((connection) => [connection[0] + offset, connection[1] + offset]);
      connections = connections.concat(offsetConnections);
      const classification = results.multiHandedness[loop];
      colors.push({
        list: offsetConnections.map((unused, i) => i + offset),
        color: classification.label,
      });
    }
    grid.updateLandmarks(landmarks, connections, colors);
  } else {
    grid.updateLandmarks([]);
  }
}

const hands = new mpHands.Hands(config);
hands.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls
  .ControlPanel(controlsElement, {
    selfieMode: false,
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })
  .add([
    new controls.StaticText({title: 'MediaPipe Hands'}),
    fpsControl,
    new controls.Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
    new controls.SourcePicker({
      onFrame: async (input, size) => {
        const aspect = size.height / size.width;
        let width, height;
        if (window.innerWidth > window.innerHeight) {
          height = window.innerHeight;
          width = height / aspect;
        } else {
          width = window.innerWidth;
          height = width * aspect;
        }
        canvasElement.width = width;
        canvasElement.height = height;
        await hands.send({image: input});
      },
    }),
    new controls.Slider({
      title: 'Max Number of Hands',
      field: 'maxNumHands',
      range: [1, 4],
      step: 1
    }),
    new controls.Slider({
      title: 'Model Complexity',
      field: 'modelComplexity',
      discrete: ['Lite', 'Full'],
    }),
    new controls.Slider({
      title: 'Min Detection Confidence',
      field: 'minDetectionConfidence',
      range: [0, 1],
      step: 0.01
    }),
    new controls.Slider({
      title: 'Min Tracking Confidence',
      field: 'minTrackingConfidence',
      range: [0, 1],
      step: 0.01
    }),
  ])
  .on(x => {
    const options = x;
    videoElement.classList.toggle('selfie', options.selfieMode);
    hands.setOptions(options);
  });


//*********************************************TONE*************************************************
//*********************************************TONE*************************************************
//*********************************************TONE*************************************************
//*********************************************TONE*************************************************
//*********************************************TONE*************************************************
//*********************************************TONE*************************************************
//******************************touch**************************************************


//*************************************** START AUDIO
document.querySelector('body')?.addEventListener('click', async () => {
  await Tone.start()
  Tone.Transport.bpm.value = 101;
  // playSample("B1")

  console.log('audio is ready')
})


let playingD1 = false;
let playingD2 = false;


let loopD2

let playingB1 = false;
let playingC1 = false;
let playingM1 = false;

let loopD1
let loopB1
let loopC1
let loopM1


const sampler = new Tone.Sampler({
  urls: {
    D1: "Drums1.ogg",
    D2: "Drums2.ogg",
    D3: "Drums3.ogg",
    D4: "Drums4.ogg",
    B1: "Bass1.ogg",
    C1: "Chords1.ogg",
    A1: "Melodies1.ogg",
    // M1: "Melodies1.ogg",
  },
  release: 1,
  baseUrl: "https://smokingmonkey.github.io/AirMusic/Samples/",

}).toDestination();


function playSample(sampleName)
{
  if (sampleName === "D1") {
    // console.log("D11111")

    if (playingD2) {
      loopD2.stop()
      playingD2 = false
    }

    if (!playingD1) {
      (document.getElementById(sampleName)).style.backgroundColor = "#FFFF00D3";


      console.log("Started")

      playingD1 = true;
      loopD1 = new Tone.Loop((time) => {
        // triggered every eighth note.
        sampler.triggerAttack("D1")
        Tone.Transport.start();

      }, "1n").start(0);
      Tone.Transport.start();
    } else {
      playingD1 = false;
      //loop1.triggerRelease(Tone.now())
      loopD1.stop()
      // Tone.transport.stop()

      console.log("Stopped")

    }
  }

  if (sampleName === "D2") {
    if (playingD1) {
      loopD1.stop()

      playingD1 = false
    }


    if (!playingD2) {

      playingD2 = true;
      loopD2 = new Tone.Loop((time) => {
        // triggered every eighth note.
        sampler.triggerAttack("D2")
        Tone.Transport.start();

      }, "2.36").start(0);
      Tone.Transport.start();
    } else {
      playingD2 = false;
      loopD2.stop()

    }
  }
  if (sampleName === "D3") {
    sampler.triggerAttack("D3")

  }
  if (sampleName === "D4") {
    sampler.triggerAttack("D4")

  }


  if (sampleName === "B1") {
     console.log("bbbbbbbbb")

    // if (playingD2) {
    //   loop2.stop()
    //   playingD2 = false
    // }

    if (!playingB1) {

      (document.getElementById(sampleName)).style.backgroundColor = "#76FF03D3";
      console.log("Started bbbbbbb")

      playingB1 = true;
      loopB1 = new Tone.Loop((time) => {
        // triggered every eighth note.
        sampler.triggerAttack("B1")
        Tone.Transport.start();

      }, "2m").start(0);
      Tone.Transport.start();
    } else {
      playingB1 = false;
      //loop1.triggerRelease(Tone.now())
      loopB1.stop()
      // Tone.transport.stop()

      console.log("Stopped")

    }
  }


  if (sampleName === "C1") {
    // console.log("D11111")

    // if (playingD2) {
    //   loop2.stop()
    //   playingD2 = false
    // }

    if (!playingC1) {
      (document.getElementById(sampleName)).style.backgroundColor = "#F06292DA";

      console.log("Started")

      playingC1 = true;
      loopC1 = new Tone.Loop((time) => {
        // triggered every eighth note.
        sampler.triggerAttack("C1")
        Tone.Transport.start();

      }, "2m").start(0);
      Tone.Transport.start();
    } else {
      playingC1 = false;
      //loop1.triggerRelease(Tone.now())
      loopC1.stop()
      // Tone.transport.stop()

      console.log("Stopped")

    }
  }

  if (sampleName === "M1") {
    // console.log("D11111")

    // if (playingD2) {
    //   loop2.stop()
    //   playingD2 = false
    // }

    if (!playingM1) {

      (document.getElementById(sampleName)).style.backgroundColor = "#4FC3F7DD";
      console.log("Started")

      playingM1 = true;
      loopM1 = new Tone.Loop((time) => {
        // triggered every eighth note.
        sampler.triggerAttack("A1")
        Tone.Transport.start();

      }, "2m").start(0);
      Tone.Transport.start();
    } else {
      playingM1 = false;
      //loop1.triggerRelease(Tone.now())
      loopM1.stop()
      // Tone.transport.stop()

      console.log("Stopped")

    }
  }


}


function isInside(objectId, indexTipPos,)
{
  // console.log("************************************")

  //*************************Is inside D1
  var canvasRect = canvasElement.getBoundingClientRect(),
    D1 = document.getElementById(objectId),
    D1Rect = D1.getBoundingClientRect();


  // alert('Element is ' + offset + ' vertical pixels from <body>');
  // console.log(" element normalized x pos " + D1Rect.left / canvasRect.width);
  // console.log(" element normalized y pos " + D1Rect.top / canvasRect.height);
  // console.log("D1 height" + D1Rect.height + "D1 width" + D1Rect.width);

  var d1Left = D1Rect.left / canvasRect.width
  var d1Top = D1Rect.top / canvasRect.height
  // var d1H = D1Rect.height
  // var d1w = D1Rect.width
  var d1RightBoundary = D1Rect.right / canvasRect.width
  var d1BottomBoundary = D1Rect.bottom / canvasRect.height


  try {
    var isOverLeftBoundary = indexTipPos.x > d1Left
    var isOverTopBoundary = indexTipPos.y > d1Top

    var isOverRightBoundary = indexTipPos.x < d1RightBoundary
    var isOverBottomBoundary = indexTipPos.y < d1BottomBoundary

    if (isOverLeftBoundary && isOverRightBoundary && isOverTopBoundary && isOverBottomBoundary) {
      console.log("isInside*************: " + objectId)
      //isInside = true;
      return true
    } else {
      // console.log("isOutside")
      //isInside = false;
      return false

    }
  } catch (e) {
// console.log("failure")
  }

  //end is inside D1
}
