import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  Stepper as MuiStepper,
  Step,
  StepLabel,
  StepConnector,
} from "@material-ui/core";
import clsx from "clsx";
import { CheckOutlined } from "@material-ui/icons";

const QontoConnector = withStyles((theme) => ({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  active: {
    "& $line": {
      borderColor: theme.palette.xioRed.main,
    },
  },
  completed: {
    "& $line": {
      borderColor: theme.palette.xioRed.main,
    },
  },
  line: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}))(StepConnector);

const useQontoStepIconStyles = makeStyles((theme) => ({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
  },
  active: {
    color: theme.palette.xioRed.main,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },
  completed: {
    color: theme.palette.xioRed.main,
    zIndex: 1,
    fontSize: 18,
  },
}));

function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {completed ? (
        <CheckOutlined className={classes.completed} />
      ) : (
        <div className={classes.circle} />
      )}
    </div>
  );
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  stepper: {
    backgroundColor: theme.palette.background.primary,
    padding: 0,
  },
  label: {
    "& .MuiStepLabel-label": {
      marginTop: 0,
    },
  },
}));

export default function Stepper({ step, steps = ["APPROVE FLASH", "STAKE"] }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  // useEffect(() => {
  //   if (tab === "pool") {
  //     if (step === "pendingApproval") {
  //       setActiveStep(0);
  //     } else if (step === "pendingApprovalToken") {
  //       setActiveStep(1);
  //     } else if (step === "poolProposal") {
  //       setActiveStep(2);
  //     }
  //   } else {
  //     if (step === "pendingApproval") {
  //       setActiveStep(0);
  //     } else if (step === "pendingApprovalToken") {
  //       setActiveStep(1);
  //     } else if (step === "flashstakeProposal" || "swapProposal") {
  //       setActiveStep(1);
  //     }
  //   }
  // }, [step]);

  useEffect(() => {
    if (step === "pendingApproval") {
      setActiveStep(0);
    } else if (
      ["flashstakeProposal", "swapProposal", "approvalTokenProposal"].includes(
        step
      )
    ) {
      setActiveStep(1);
    } else if (step === "poolProposal") {
      setActiveStep(2);
    }
  }, [step]);

  return (
    <MuiStepper
      alternativeLabel
      activeStep={activeStep}
      connector={<QontoConnector />}
      className={classes.stepper}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={QontoStepIcon}
            className={classes.label}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}
