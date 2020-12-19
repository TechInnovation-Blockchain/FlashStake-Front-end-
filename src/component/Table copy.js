import React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  ExitToAppOutlined,
  UnfoldMore,
  MonetizationOn,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  table: {
    [theme.breakpoints.up("sm")]: {
      tableLayout: "fixed",
    },
    "& *": {
      fontWeight: 700,
    },
    "& .MuiTableCell-root": {
      border: " none",
    },
  },
  head: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
  tableCell: {
    padding: `0 !important`,
  },
  tableHeadItemBtn: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(0),
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(1),
    },
  },
  sortIcon: {
    color: theme.palette.xioRed.main,
  },
}));

export default function TableComponent() {
  const classes = useStyles();

  // const headItems = [];
  const headItems = ["TOKEN", "AVAILABLE", "WITHDRAW"];
  const bodyData = [
    {
      token: "FLASH",
      available: 144,
      total: 444,
    },
    {
      token: "DAI",
      available: 123,
      total: 4532,
    },
    {
      token: "LINK",
      available: 73,
      total: 342,
    },
  ];

  return (
    <MuiTable className={classes.table}>
      <TableHead className={classes.head}>
        {headItems.map((headItem) => (
          <TableCell
            key={headItem}
            align="center"
            className={classes.tableCell}
          >
            <Button className={classes.tableHeadItemBtn}>
              <UnfoldMore fontSize="small" className={classes.sortIcon} />
              {headItem}
            </Button>
          </TableCell>
        ))}
      </TableHead>
      <TableBody>
        {bodyData.map((rowItem) => (
          <TableRow key={rowItem.token}>
            <TableCell align="center" className={classes.tableCell}>
              <MonetizationOn size="small" />
              {rowItem.token}
            </TableCell>
            <TableCell align="center" className={classes.tableCell}>
              {rowItem.available}/{rowItem.total}
            </TableCell>
            <TableCell align="center" className={classes.tableCell}>
              <IconButton>
                <ExitToAppOutlined fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </MuiTable>
  );
}
