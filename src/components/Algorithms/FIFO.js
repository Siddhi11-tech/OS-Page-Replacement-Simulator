import React, { useState } from "react";
import { Box, Typography, makeStyles, TextField, Button } from "@material-ui/core";
import TableHeader from "./TableHeader";
import PieChart from "./PieChart";

const useStyles = makeStyles((theme) => ({
  table: {
    width: "100%",
    fontFamily: "arial, sans-serif",
    borderCollapse: "collapse",
    marginTop: 40,
    marginBottom: 40,
    fontSize: 20,
    display: "block",
    overflowX: "auto",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
    },
  },
  main: {
    border: "1px solid #dddddd",
    textAlign: "center",
    padding: "10px",
  },
  summary: {
    textAlign: "center",
    marginTop: 30,
    border: "1px solid white",
    borderRadius: "25px",
  },
  header: {
    fontSize: 46,
    textAlign: "center",
  },
  sum: {
    padding: "40px",
  },
  sumText: {
    fontSize: 30,
    textAlign: "left",
  },
  inputContainer: {
    margin: "20px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  inputField: {
    marginRight: "10px",
  },
  button: {
    marginTop: "10px",
  },
}));

const FIFO = () => {
  const classes = useStyles();

  const [pageSeq, setPageSeq] = useState([]);
  const [frames, setFrames] = useState(3); // Default frame size
  const [results, setResults] = useState(null);

  // Handle page sequence input change
  const handleSeqChange = (event) => {
    const inputSeq = event.target.value;
    const parsedSeq = inputSeq.split("").map(Number); // Parse input as numbers
    setPageSeq(parsedSeq);
  };

  // Handle frame size input change
  const handleFrameChange = (event) => {
    setFrames(Number(event.target.value));
  };

  // Function to create an array for the number of frames
  const frameCreator = (f) => {
    let result = [];
    for (let i = 0; i < f; i++) {
      result.push(i + 1);
    }
    return result;
  };

  // FIFO Algorithm to calculate page hits and faults
  const fifoResultGiver = (frame, seq) => {
    let pageFaults = 0;
    let temp = Array(frame).fill(-1); // Initialize empty frames with -1
    let result = [];
    let index_arr = [];

    for (let i = 0; i < seq.length; i++) {
      let hit = false;
      let fault = false;
      let flag = 0;

      // Check if page already in one of the frames (Page hit condition)
      for (let j = 0; j < frame; j++) {
        if (seq[i] === temp[j]) {
          flag++;
          index_arr.push(j);
          pageFaults--;
          hit = true;
        }
      }
      pageFaults++; // Increment page fault for every access
      fault = true;

      if (pageFaults <= frame && flag === 0) {
        temp[i] = seq[i];
        index_arr.push(i);
      } else if (flag === 0) {
        let pageToReplace = (pageFaults - 1) % frame;
        temp[pageToReplace] = seq[i];
        index_arr.push(pageToReplace);
      }

      let elements = [];
      for (let j = 0; j < frame; j++) {
        elements.push(temp[j]);
      }
      if (hit) {
        elements.push("HIT");
      } else if (fault) {
        elements.push("MISS");
      }

      result.push(elements);
    }

    return { result, pageFaults, index_arr };
  };

  const rowResultMaker = (frames, pageSeq) => {
    const { result } = fifoResultGiver(frames, pageSeq);

    return (
      <>
        {frameCreator(frames).map((frameLabel, rowIndex) => (
          <tr key={rowIndex}>
            <td className={classes.main}>{`Frame ${frameLabel}`}</td>
            {result.map((step, stepIndex) => (
              <td
                key={stepIndex}
                className={classes.main}
                style={{
                  backgroundColor: step[rowIndex] !== -1 ? "#c0e6f0" : "white",
                }}
              >
                {step[rowIndex] !== -1 ? step[rowIndex] : ""}
              </td>
            ))}
          </tr>
        ))}

        <tr>
          <td className={classes.main}>Status</td>
          {result.map((step, index) => (
            <td
              key={index}
              className={classes.main}
              style={{
                backgroundColor: step[frames] === "HIT" ? "#a4fcb3" : "#fca4a4",
              }}
            >
              {step[frames]}
            </td>
          ))}
        </tr>
      </>
    );
  };

  const handleCalculate = () => {
    const fifoResult = fifoResultGiver(frames, pageSeq);
    setResults(fifoResult);
  };

  const pageHits = pageSeq.length - (results?.pageFaults || 0);

  return (
    <>
      <TableHeader algoName={"FIFO (First In First Out)"} />

      <Box className={classes.inputContainer}>
      <Box className={classes.inputContainer}>
  <TextField
    label="Enter Page Sequence"
    variant="outlined"
    className={classes.inputField}
    onChange={handleSeqChange}
    InputProps={{
      style: {
        color: "white", // This sets the input text color to white
      },
    }}
    InputLabelProps={{
      style: {
        color: "white", // This sets the label color to white
      },
    }}
  />
  <TextField
    label="Number of Frames"
    variant="outlined"
    type="number"
    className={classes.inputField}
    onChange={handleFrameChange}
    value={frames}
    InputProps={{
      style: {
        color: "white", // This sets the input text color to white
      },
    }}
    InputLabelProps={{
      style: {
        color: "white", // This sets the label color to white
      },
    }}
  />
</Box>

        <Button variant="contained" color="primary" onClick={handleCalculate}>
          Calculate
        </Button>
      </Box>

      {results && (
        <Box className={classes.table}>
          <table>
            <thead>
              <tr>
                <th className={classes.main}>Reference</th>
                {pageSeq.map((page, index) => (
                  <th key={index} className={classes.main}>
                    {page}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{rowResultMaker(frames, pageSeq)}</tbody>
          </table>

          <Box className={classes.summary}>
            <Typography className={classes.header}>Summary</Typography>
            <Box className={classes.sum}>
              <Typography className={classes.sumText}>Total Frames: {frames}</Typography>
              <Typography className={classes.sumText}>Total Pages: {pageSeq.length}</Typography>
              <Typography className={classes.sumText}>Page Hits: {pageHits}</Typography>
              <Typography className={classes.sumText}>Page Faults: {results.pageFaults}</Typography>
            </Box>

            <Box className={classes.chart}>
              <PieChart hit={pageHits} fault={results.pageFaults} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default FIFO;
