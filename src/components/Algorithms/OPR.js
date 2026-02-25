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

const OPR = () => {
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

  // OPR Algorithm to calculate page hits and faults
  const oprResultGiver = (frame, seq) => {
    let frame_arr = Array(frame).fill(-1); // Initialize frame array with -1
    let faults = 0;
    let result = [];
    let index_arr = [];

    for (let i = 0; i < seq.length; i++) {
      let hit = false;
      let fault = false;

      // If the page is already in the frame (hit)
      for (let j = 0; j < frame; j++) {
        if (seq[i] === frame_arr[j]) {
          index_arr.push(j);
          hit = true;
          break;
        }
      }

      // If no hit, need to replace a page (fault)
      if (!hit) {
        if (frame_arr.includes(-1)) {
          // If there is space in the frame
          frame_arr[frame_arr.indexOf(-1)] = seq[i];
        } else {
          // Find the page to replace (Optimal Page Replacement)
          let farthest = -1;
          let replaceIndex = -1;
          for (let j = 0; j < frame; j++) {
            let nextUse = seq.slice(i + 1).indexOf(frame_arr[j]);
            if (nextUse === -1 || nextUse > farthest) {
              farthest = nextUse;
              replaceIndex = j;
            }
          }
          frame_arr[replaceIndex] = seq[i];
          index_arr.push(replaceIndex);
        }
        faults++;
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
    const { result } = oprResultGiver(frames, pageSeq);

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
    const oprResult = oprResultGiver(frames, pageSeq);
    setResults(oprResult);
  };

  const pageHits = pageSeq.length - (results?.faults || 0);

  return (
    <>
      <TableHeader algoName={"OPR (Optimal Page Replacement)"} />

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

export default OPR;
