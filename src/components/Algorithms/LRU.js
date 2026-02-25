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

const LRU = () => {
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

  // To find least recently used element's position
  const findLru = (temp, frame) => {
    let minimum = temp[0];
    let pos = 0;

    for (let i = 0; i < frame; i++) {
      if (temp[i] < minimum) {
        minimum = temp[i];
        pos = i;
      }
    }
    return pos;
  };

  // LRU Algorithm to calculate page hits and faults
  const lruResultGiver = (frame, seq) => {
    let temp = [];
    let frame_arr = Array(frame).fill(-1); // Initialize frame array with -1
    let faults = 0;
    let counter = 0;
    let result = [];
    let index_arr = [];

    for (let i = 0; i < seq.length; i++) {
      let flag1 = 0;
      let flag2 = 0;
      let hit = false;
      let fault = false;

      // If the page is already in the frame (hit)
      for (let j = 0; j < frame; j++) {
        if (seq[i] === frame_arr[j]) {
          counter++;
          temp[j] = counter;
          index_arr.push(j);
          flag1 = 1;
          flag2 = 1;
          hit = true;
          break;
        }
      }

      // Check if there is an empty frame (-1)
      if (flag1 === 0) {
        for (let j = 0; j < frame; j++) {
          if (frame_arr[j] === -1) {
            faults++;
            frame_arr[j] = seq[i];
            index_arr.push(j);
            counter++;
            temp[j] = counter;
            flag2 = 1;
            fault = true;
            break;
          }
        }
      }

      // If no empty frame, find the least recently used page
      if (flag2 === 0) {
        const pos = findLru(temp, frame);
        faults++;
        counter++;
        temp[pos] = counter;
        frame_arr[pos] = seq[i];
        index_arr.push(pos);
        fault = true;
      }

      // Create an array of elements to display in the table
      let elements = [];
      for (let j = 0; j < frame; j++) {
        elements.push(frame_arr[j]);
      }

      if (hit) {
        elements.push("HIT");
      } else if (fault) {
        elements.push("FAULT");
      }

      result.push(elements);
    }

    return { result, faults, index_arr };
  };

  const rowResultMaker = (frames, pageSeq) => {
    const { result } = lruResultGiver(frames, pageSeq);

    return (
      <>
        {Array.from({ length: frames }, (_, i) => (
          <tr key={i}>
            <td className={classes.main}>{`Frame ${i + 1}`}</td>
            {result.map((step, stepIndex) => (
              <td
                key={stepIndex}
                className={classes.main}
                style={{
                  backgroundColor: step[i] !== -1 ? "#c0e6f0" : "white",
                }}
              >
                {step[i] !== -1 ? step[i] : ""}
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
    const lruResult = lruResultGiver(frames, pageSeq);
    setResults(lruResult);
  };

  const pageHits = pageSeq.length - (results?.faults || 0);

  return (
    <>
      <TableHeader algoName={"LRU (Least Recently Used)"} />

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
              <Typography className={classes.sumText}>Page Faults: {results.faults}</Typography>
            </Box>

            <Box className={classes.chart}>
              <PieChart hit={pageHits} fault={results.faults} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default LRU;
