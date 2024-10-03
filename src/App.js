import React, { useState, useEffect, useRef } from "react";
import samplePDF from "./sample.pdf";
import SinglePage from "./components/SinglePage";
import AutoTextArea from "./components/AutoTextArea";
import "./App.css";

export default function App() {
  const [result, setResult] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [redoStack, setRedoStack] = useState([]);
  const [flag, setFlag] = useState("");
  const [bounds, setBounds] = useState({});
  const [isText, setIsText] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const tempRef = useRef(null);

  useEffect(() => {
    if (isText) {
      setIsText(false);
    }
  }, [result]);

  //Keep track of current page number
  const pageChange = (num) => {
    setPageNumber(num);
  };

  //Function to add text in PDF
  const addText = () => {
    //Flag to change cursor if text
    setIsText(true);
    document.getElementById("drawArea").addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        setResult((result) => [
          ...result,
          {
            id: generateKey(e.pageX),
            x: e.pageX,
            y: e.pageY - 10,
            text: "",
            page: pageNumber,
            type: "text",
            ref: tempRef,
          },
        ]);
      },
      { once: true }
    );
  };

  //Undo function for both line and text
  const undo = () => {
    let temp = result.pop();
    if (temp) {
      if (temp.type === "freehand") {
        //Flag for DrawArea reference
        setFlag("undo");
      }
      setRedoStack((stack) => [...stack, temp]);
      setResult(result);
    }
  };

  //Flag for DrawArea reference
  const changeFlag = () => {
    setFlag("");
  };

  //Redo functionality
  const redo = () => {
    let top = redoStack.pop();
    if (top) {
      if (top.type === "freehand") {
        //Flag for DrawArea reference
        setFlag("redo");
      }
      setResult((res) => [...res, top]);
    }
  };

  const getPaths = (el) => {
    setResult((res) => [...res, el]);
  };

  const getBounds = (obj) => {
    setBounds(obj);
  };

  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };

  const onTextChange = (id, txt, ref) => {
    let indx = result.findIndex((x) => x.id === id);
    let item = { ...result[indx] };
    item.text = txt;
    item.ref = ref;
    result[indx] = item;
    setResult(result);
  };

  const changeButtonType = (type) => {
    setButtonType(type);
  };

  const resetButtonType = () => {
    setButtonType("");
  };

  return (
    <div className="app">
      {result.map((res) => {
        if (res.type === "text") {
          let isShowing = "hidden";
          if (res.page === pageNumber) {
            isShowing = "visible";
          }
          return (
            <AutoTextArea
              key={res.id}
              unique_key={res.id}
              val={res.text}
              onTextChange={onTextChange}
              style={{
                visibility: isShowing,
                color: "red",
                fontWeight: "normal",
                fontSize: 16,
                zIndex: 20,
                position: "absolute",
                left: res.x + "px",
                top: res.y + "px",
              }}
            ></AutoTextArea>
          );
        } else {
          return null;
        }
      })}

      <h1>
        <a target="_blank" href="https://www.npmjs.com/package/react-pdf">
          React PDF
        </a>{" "}
        Editor
      </h1>

      <ul className="pdf-editor-opts">
        <li>
          <button onClick={undo}>Undo</button>
        </li>
        <li>
          <button onClick={redo}>Re-do</button>
        </li>
        <li>
          <button onClick={addText}>Add Text</button>
        </li>
        <li>
          <button onClick={() => changeButtonType("draw")}>Draw</button>
        </li>
        <li>
          <button onClick={() => changeButtonType("download")}>Download</button>
        </li>
      </ul>

      <SinglePage
        resetButtonType={resetButtonType}
        buttonType={buttonType}
        cursor={isText ? "text" : "default"}
        pdf={samplePDF}
        pageChange={pageChange}
        getPaths={getPaths}
        flag={flag}
        getBounds={getBounds}
        changeFlag={changeFlag}
      />
     
    </div>
  );
}
