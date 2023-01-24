import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import explode from "./explode";
import Timer from "./../Timer/Timer";
import EndScreen from "../EndScreen/EndScreen";
import Loading from "../Loading/Loading";
import "./Quiz.css";
import Aellipse from "../../Images/Aellipse.svg";
import Bellipse from "../../Images/Bellipse.svg";
import Cellipse from "../../Images/Cellipse.svg";
import Dellipse from "../../Images/Dellipse.svg";
import shuffleOptions from "../../lib/shuffleOptions";
import Replacer from "../../lib/Replacer";
// import { randomSparks } from "./spark";
import { correctAnimation, wrongAnimation } from "./answerAnimation";
import AudioPlayer from "./AudioPlayer";
import { SkillHeaderContainer } from "../SkillHeaderContainer/SkillHeaderContainer";
import { DropdownOptions } from "../DropdownOptions/DropdownOptions";
// import { DropdownOptions } from "./DropdownOptions/DropdownOptions";
import { Typography, Divider, Popover, Button } from "antd";
import QuoteApp from "../DraggableList/MainDraggable";
import { actions, GlobalContext } from "../../App";
import apiList, { server } from "../../lib/apiList";
// import { Popover, Button } from "antd";
const { Title, Paragraph, Text } = Typography;

const content = (
  <div>
    <p>ContentContentContentContentContentContentContent</p>
    <p>ContContentContentContentContentContentContentent</p>
  </div>
);
const time = {
  Easy: 3000,
  easy: 3000,
  Medium: 5000,
  Hard: 7000,
};
const points = {
  Easy: 2,
  Medium: 5,
  Hard: 10,
};

const optionImg = [Aellipse, Bellipse, Cellipse, Dellipse];

const Quiz = ({ user, reset }) => {
  const [currQuestion, setCurrQuestion] = useState(0);
  const [optionChosen, setOptionChosen] = useState();
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState();
  const [options, setOptions] = useState();
  // gameState options [loading, finished,  active, paused]
  const [gameState, setGameState] = useState("loading");
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState();
  const [timer, setTimer] = useState(1000 * 8);
  const [timerState, setTimerState] = useState("idle");
  const [showBomb, setShowBomb] = useState(true);
  const [optionStyles, setOptionStyles] = useState([]);
  const [answerProcessed, setAnswerProcessed] = useState(true);
  const [scoreUploaded, setScoreUploaded] = useState(false);
  const [mouseClick, setMouseClick] = useState();
  const [isOptionsProcessed, setIsOptionsProcessed] = useState(false);
  const history = useHistory();
  // const { isGame } = useParams();
  const {
    state: { isGame, level },
    dispatch,
  } = useContext(GlobalContext);

  console.log({ isGame });

  const bombRef = useRef();
  const timerRef = useRef();

  const [optionIndex, setOptionIndex] = useState(0);

  const optionsDropdown = [
    { value: "Reading" },
    { value: "Listing" },
    { value: "Writing" },
  ];

  useEffect(() => {
    if (!user) {
      history.push("/login");
    }
  }, []);
  // fetch data and set game and timer active
  useEffect(() => {
    if (user) {
      console.log(user.dateTime);
      console.log("initial useEffect");
      // if (!questions) {
      if (true) {
        console.log("about to fetch");
        fetch(
          `${apiList.questions}?category=${optionsDropdown[optionIndex].value}&level=${level}`
        )
          .then((res) => res.json())
          .then((data) => {
            console.log("got data", data);
            setQuestions(data);
            setGameState("active");
            setTimerState("active");
            setCurrQuestion(0);
            // if (!answerProcessed) debugger;
            setAnswerProcessed(true);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }
  }, [optionIndex]);

  useEffect(() => {
    // if (isGame === "true") {
    if (isGame) {
      try {
        const bombPosition =
          bombRef.current.children[1].getBoundingClientRect();
        const y =
          bombPosition.y +
          bombPosition.height / 2 -
          window.innerHeight / 2 +
          window.scrollY -
          70;
        // randomSparks.tune({ x: 85, y: y });
        console.log(y);
        if (timerState === "active") {
          console.log("spark");

          // randomSparks.play();
        } else {
          // randomSparks.stop();
        }
      } catch {
        console.log("caught");
      } finally {
        return () => {
          // randomSparks.stop();
        };
      }
    }
  }, [timerState, currQuestion]);

  // after the game is over save user score
  useEffect(() => {
    if (gameState === "finished" && !scoreUploaded) {
      const payload = {
        username: user.username,
        userID: user.id,
        score,
        date: Date.now(),
      };
      console.log({ payload });
      fetch(apiList.score, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (res.status === 200) {
          console.log("score saved");
          setScoreUploaded(true);
        } else {
          console.log("unable to save score");
        }
      });
    }
  }, [gameState, scoreUploaded]);

  // show questions one by one
  useEffect(() => {
    // Quiz first question only shows the correct also answer error in here

    console.log("in create question useEffect", { gameState, answerProcessed });
    // if (gameState === "active") debugger;
    if (gameState !== "loading") {
      console.log(isOptionsProcessed);
      if (answerProcessed && !isOptionsProcessed) {
        setIsOptionsProcessed(true);
        setAnswerProcessed(false);
        console.log("creating question", {
          currQuestion,
          q: questions[currQuestion],
          questions,
        });

        if (
          questions[currQuestion]?.correct_answer &&
          questions[currQuestion]?.incorrect_answers
        ) {
          if (questions[currQuestion]?.type === "True and False") {
            const incorrect =
              questions[currQuestion]?.correct_answer === "true"
                ? ["false"]
                : ["true"];

            const [answers, correctIndex] = shuffleOptions(
              questions[currQuestion]?.correct_answer,
              incorrect
            );
            setOptions(answers);
            setCorrectAnswerIndex(correctIndex);
          } else {
            const [answers, correctIndex] = shuffleOptions(
              questions[currQuestion]?.correct_answer,
              questions[currQuestion]?.incorrect_answers
            );
            setOptions(answers);
            setCorrectAnswerIndex(correctIndex);
          }
        }
      }
    }
  }, [gameState, currQuestion, answerProcessed, questions, isOptionsProcessed]);

  // after select an answer show only the correct answer
  useEffect(() => {
    console.log("options style useEffect", options);
    if (options) {
      setOptionStyles(options.map(() => ({ opacity: "100%" })));
    }
  }, [options]);

  // for change the timer
  useEffect(() => {
    // if (isGame === "true") {
    if (isGame) {
      console.log("in timer useEffect");
      try {
        if (timerState === "active") {
          // when the timer is over
          if (timer === 0) {
            setTimerState("idle");
            const bombPosition =
              bombRef.current.children[1].getBoundingClientRect();
            const y =
              10 +
              bombPosition.y +
              bombPosition.height / 2 -
              window.innerHeight / 2 +
              window.scrollY;
            // const x = bombPosition.x + bombPosition.width / 2;
            explode(0, y);
            setTimeout(() => {
              setShowBomb(false);
              setGameState("finished");
            }, 1000);
          }
          // for change the timer
          else {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setTimer((prevState) => prevState - 100);
            }, 100);
          }
        } else if (timerState === "paused") {
          clearTimeout(timerRef.current);
        }
      } catch {
        console.log("caught");
      }
    }
  }, [timer, timerState]);

  // handle user answer. if correct set score and increase timer
  useEffect(() => {
    console.log("process answer useEffect", { gameState, optionChosen });
    // if (gameState === "active") debugger;
    if (
      gameState === "active" &&
      optionChosen !== undefined &&
      optionChosen !== null
    ) {
      console.log("**********");

      console.log(time[questions[currQuestion].difficulty]);
      console.log(questions[currQuestion].difficulty);
      if (optionChosen === correctAnswerIndex) {
        setScore(
          (prevState) => prevState + points[questions[currQuestion].difficulty]
        );
        setTimer(
          (prevState) => prevState + time[questions[currQuestion].difficulty]
        );
      }
      setOptionChosen(null);

      console.log({
        length: questions.length,
        cureentQ: questions[currQuestion],
        cureentnext: questions[currQuestion + 1],
      });

      if (questions[currQuestion + 1]) setCurrQuestion(currQuestion + 1);
      else setGameState("finished");
      console.log("here");
      // if (!answerProcessed) debugger
      setIsOptionsProcessed(false);
      setAnswerProcessed(true);
    }
  }, [optionChosen, gameState]);

  // const [correctOrder, setCorrectOrder] = useState(false);

  const handleAnswer = (event, answerIndex, isCorrectOrder) => {
    console.log("handle answer");
    setTimerState("paused");
    setGameState("paused");

    // setIsOptionsProcessed(false);

    // highlight chosen answer
    // fade incorrect answers
    console.log("correct answer🎈🎈🎈🎈");

    console.log({ isCorrectOrder, pageX: event.offsetTop });
    if (isCorrectOrder !== undefined) {
      if (isCorrectOrder) {
        const checkAnimation = correctAnimation({
          x: event.offsetTop - window.innerWidth / 2 + 400,
          y: event.offsetTop - window.innerHeight / 2,
        });
        checkAnimation.play();
      } else {
        const crossAnimation = wrongAnimation({
          x: event.offsetTop - window.innerWidth / 2 + 400,
          y: event.offsetTop - window.innerHeight / 2,
        });
        crossAnimation.play();

        setTimeout(() => {
          console.log("order correct answer if the user didn't find it");
          console.log(questions[currQuestion].correct_answer);
        }, 5000);
      }
    }

    if (answerIndex == correctAnswerIndex) {
      const checkAnimation = correctAnimation({
        x: event.pageX - window.innerWidth / 2,
        y: event.pageY - window.innerHeight / 2,
      });

      // const checkAnimation = correctAnimation({
      //   x: window.innerWidth / 2,
      //   y: window.innerHeight / 2,
      // });
      checkAnimation.play();
    } else {
      const crossAnimation = wrongAnimation({
        x: event.pageX - window.innerWidth / 2,
        y: event.pageY - window.innerHeight / 2,
      });
      crossAnimation.play();
    }
    setOptionStyles(
      options.map((o, index) => ({
        opacity: index === correctAnswerIndex ? "100%" : "0%",
      }))
    );

    setTimeout(
      () => {
        // update option chosen
        console.log("Runnin handle answer settimeout", { answerIndex });
        console.log({ optionChosen });
        setOptionChosen(answerIndex);

        setTimerState("active");
        setGameState("active");
      },
      isCorrectOrder === undefined ? 1000 : 5000
    );
  };

  // console.log({ isGame });
  return gameState === "loading" ? (
    // return true ? (
    <Loading />
  ) : (
    <>
      <div>
        {/* isGame === "false" */}
        {!isGame && gameState !== "finished" && (
          <div>
            <DropdownOptions
              options={optionsDropdown}
              setOptionIndex={setOptionIndex}
            />
            <SkillHeaderContainer
              currentQuestion={currQuestion}
              questionsLength={questions.length}
            />
          </div>
        )}
      </div>

      <div
        ref={bombRef}
        className="Quiz "
        // style={
        //   gameState !== "finished" &&
        //   questions[currQuestion]?.type !== "question order" &&
        //   !questions[currQuestion]?.audioUrl
        //     ? { height: "55.5vh" }
        //     : {}
        // }
      >
        {gameState !== "finished" ? (
          <>
            <div className="questionWrapper">
              {isGame && (
                <p
                  className={`difficulty ${questions[currQuestion]?.difficulty}`}
                >
                  {questions[currQuestion]?.difficulty}
                </p>
              )}

              {questions[currQuestion]?.type !== "question order" ? (
                <Popover
                  content={
                    <div>
                      <p>
                        {questions[currQuestion]?.popupDescription &&
                          questions[currQuestion]?.popupDescription.pinyin}
                      </p>
                      <p>
                        {questions[currQuestion]?.popupDescription &&
                          questions[currQuestion]?.popupDescription.translation}
                      </p>
                      {/* <p>ContContentContentContentContentContentContentent</p> */}
                    </div>
                  }
                  trigger="hover"
                >
                  <Text
                    className="questionTitle"
                    style={{ fontSize: "xx-large" }}
                  >
                    {Replacer(questions[currQuestion]?.question)}
                  </Text>
                </Popover>
              ) : (
                <Text
                  className="questionTitle"
                  style={{ fontSize: "xx-large" }}
                >
                  {/* {Replacer(questions[currQuestion]?.question)} */}
                  Order words:
                </Text>
              )}

              {/* <h1 className="questionTitle">
                {Replacer(questions[currQuestion]?.question)}
              </h1> */}
            </div>
            {questions[currQuestion]?.audioUrl && (
              <AudioPlayer
                audioUrl={`${server}/${questions[currQuestion]?.audioUrl}`}
                audioDescription={questions[currQuestion]?.audioDescription}
              />
            )}
            {isGame && (
              <Timer
                score={score}
                showBomb={showBomb}
                time={`00:${Math.floor(timer / 1000)
                  .toString()
                  .padStart(2, "0")}`}
              />
            )}
            {optionsDropdown[optionIndex].value === "Writing" ? (
              <QuoteApp
                question={questions[currQuestion]?.question}
                correct_answer={questions[currQuestion]?.correct_answer}
                setCurrQuestion={setCurrQuestion}
                currQuestion={currQuestion}
                setGameState={setGameState}
                questions={questions}
                handleAnswer={handleAnswer}
              />
            ) : (
              <div className="options">
                {options &&
                  options.map((option, index) => {
                    return (
                      <button
                        style={optionStyles[index]}
                        onClick={(event) => handleAnswer(event, index)}
                      >
                        <img
                          src={optionImg[index]}
                          alt="answer"
                          className="ellipseOption"
                        />
                        {Replacer(option)}
                      </button>
                    );
                  })}
              </div>
            )}
            {/* <QuoteApp /> */}
            {/* <div className="options">
              {options &&
                options.map((option, index) => {
                  return (
                    <button
                      style={optionStyles[index]}
                      onClick={(event) => handleAnswer(event, index)}
                    >
                      <img
                        src={optionImg[index]}
                        alt="answer"
                        className="ellipseOption"
                      />
                      {Replacer(option)}
                    </button>
                  );
                })}
            </div> */}
          </>
        ) : (
          <EndScreen
            user={user}
            score={score}
            resetQuiz={reset}
            isGame={isGame}
          />
        )}
      </div>
    </>
  );
};

export default Quiz;
