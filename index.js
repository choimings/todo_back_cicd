const express = require("express"); // express 모듈 가져오기
const cors = require("cors"); // cors 모듈 가져오기
const PORT = 8080;
const path = require("path");
const bodyParser = require("body-parser");
const spawn = require("child_process").spawn;

const app = express(); // express 모듈을 사용하기 위해 app 변수에 할당한다.

app.use(cors()); //htpp, https 프로토콜을 사용하는 서버 간의 통신을 허용한다.
app.use(express.json()); // express 모듈의 json() 메소드를 사용한다.

app.get("/", (req, res) => {
  res.send("Hello world https test completed");
});

app.post("/chat", (req, res) => {
  try {
    const sendedQuestion = req.body.question;

    // EC2 서버에서 현재 실행 중인 Node.js 파일의 절대 경로를 기준으로 설정.
    const scriptPath = path.join(__dirname, "bizchat.py");

    // EC2 서버에서 실행하는 절대 경로: 개발 테스트 시 사용 불가
    // const pythonPath = path.join(__dirname, "venv", "bin", "python3");

    // 개발 테스트 시 사용하는 절대 경로
    const pythonPath = path.join(__dirname, "venv", "Scripts", "python.exe");

    // Spawn the Python process with the correct argument
    const result = spawn(pythonPath, [scriptPath, sendedQuestion]);

    let responseData = "";

    result.stdout.on("data", (data) => {
      responseData += data.toString();
    });

    // Listen for errors from the Python script
    result.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      res.status(500).json({ error: data.toString() });
    });

    // Handle the close event of the child process
    result.on("close", (code) => {
      if (code === 0) {
        res.status(200).json({ answer: responseData });
      } else {
        res
          .status(500)
          .json({ error: `Child process exited with code ${code}` });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/weather", (req, res) => {
  const requestedDate = req.body.date; // 사용자가 입력한 날짜

  const execPython = path.join(__dirname, "weather.py"); // 파이썬 파일 경로
  const pythonPath = path.join(__dirname, "venv", "Scripts", "python.exe"); // 파이썬 실행 경로
  const net = spawn(pythonPath, [execPython, requestedDate]);

  let output = "";

  // 파이썬 파일의 출력을 받아옴
  net.stdout.on("data", function (data) {
    output += data.toString();
  });

  net.on("close", (code) => {
    if (code === 0) {
      res.status(200).json({ weather: output }); // 성공적으로 데이터를 받았을 때 응답
    } else {
      res.status(500).send("Something went wrong");
    }
  });

  net.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.use(require("./routes/getRoutes"));
app.use(require("./routes/postRoutes"));
app.use(require("./routes/deleteRoutes"));
app.use(require("./routes/updateRoutes"));

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
