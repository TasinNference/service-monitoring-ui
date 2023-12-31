import React, { useEffect, useRef, useState } from 'react';
import ServicesTable from '../ServicesTable';
import ResizeHandle from '../../components/ResizeHandle';
import { Panel, PanelGroup } from 'react-resizable-panels';
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useLocation } from 'react-router-dom';
import { rootPath } from '../../configs/routesConfig';
import _ from 'lodash';
import { routes } from '../../utils/routesHelper';
import moment from 'moment';
import { useInterval } from '../../hooks/useInterval';
import Charts from '../../components/Charts';
import { DatePicker, DateTimeField, DateTimePicker } from '@mui/x-date-pickers';

function ButtonField(props) {
  const {
    setOpen,
    label,
    id,
    disabled,
    InputProps: { ref } = {},
    inputProps: { 'aria-label': ariaLabel } = {}
  } = props;

  return (
    <Button
      variant="outlined"
      id={id}
      disabled={disabled}
      ref={ref}
      aria-label={ariaLabel}
      onClick={() => setOpen?.((prev) => !prev)}
    >
      {label ?? 'Pick a date'}
    </Button>
  );
}

function ButtonDatePicker(props) {
  const [open, setOpen] = React.useState(false);

  return (
    <DatePicker
      slots={{ field: ButtonField, ...props.slots }}
      slotProps={{ field: { setOpen } }}
      {...props}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
}

const Statistics = () => {
  const [now, setNow] = useState(moment());
  const [past, setPast] = useState(now.clone().subtract(30, 'm'));
  const location = useLocation();
  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(null);
  const [directories, setDirectories] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const [showGraphs, setShowGraphs] = useState(true);
  const [layout, setLayout] = useState('horizontal');
  const [machine, setMachine] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!showTable) setShowGraphs(true);
  }, [showTable]);

  useEffect(() => {
    if (!showGraphs) setShowTable(true);
  }, [showGraphs]);

  const toggleTable = () => {
    setShowTable(!showTable);
  };

  const toggleGraphs = () => {
    setShowGraphs(!showGraphs);
  };

  const toggleLayout = () => {
    setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal');
  };

  useInterval(() => {
    setRefresh(refresh + 1);
    setNow(moment());
  }, [15000]);

  useEffect(() => {
    setPast(now.clone().subtract(30, 'm'));
  }, [now]);

  useEffect(() => {
    const allPaths = location.pathname.replace(rootPath + '/', '').split('/');
    let sumPath = '';
    let count = 0;
    let tempDir = '';

    while (count < allPaths.length) {
      if (count !== 0) {
        sumPath = [sumPath, allPaths[count]].join('.children.');
      } else {
        sumPath = allPaths[0];
      }

      const label = _.get(routes, sumPath).label;

      tempDir = tempDir
        ? [tempDir, label].join(`\u00A0\u00A0\u00A0>\u00A0\u00A0\u00A0`)
        : label;
      count += 1;
    }

    setDirectories(tempDir);
    const tempMachine = _.get(routes, allPaths.join('.children.'));
    setMachine(tempMachine);
  }, [location.pathname]);

  return (
    <div
      style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}
    >
      <Card
        elevation="2"
        sx={{
          margin: '15px 15px',
          padding: '10px 25px',
          borderRadius: '100px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>{directories}</div>
          <div>
            <Tooltip title={`${showTable ? 'Hide' : 'Show'} Table`}>
              <IconButton onClick={toggleTable}>
                <TableRowsIcon color={showTable ? 'info' : 'inherit'} />
              </IconButton>
            </Tooltip>
            <Tooltip title={`${showGraphs ? 'Hide' : 'Show'} Graphs`}>
              <IconButton onClick={toggleGraphs}>
                <TimelineIcon color={showGraphs ? 'info' : 'inherit'} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </Card>
      <div style={{ margin: '0 15px 15px 15px' }}>
        {false ? (
          <Card
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <Typography>No Data Found</Typography>
          </Card>
        ) : (
          <PanelGroup
            disablePointerEventsDuringResize
            autoSaveId="example"
            direction={layout}
          >
            {showTable && (
              <>
                <Panel
                  order={1}
                  minSize={30}
                  style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      flexGrow: 1,
                      overflow: 'auto',
                      border: '1px solid rgb(50,50,50)'
                    }}
                  >
                    <ServicesTable
                      refresh={refresh}
                      machine={machine?.machine_name}
                    />
                  </Card>
                </Panel>
              </>
            )}
            {showTable && showGraphs && <ResizeHandle />}
            {showGraphs && (
              <>
                <Panel
                  order={2}
                  minSize={40}
                  onResize={() =>
                    setPanelHeight(panelRef.current?.clientHeight)
                  }
                  style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Charts
                    refresh={refresh}
                    machine={machine}
                    panelRef={panelRef}
                    panelHeight={panelHeight}
                  />
                </Panel>
              </>
            )}
          </PanelGroup>
        )}
      </div>
    </div>
  );
};

export default Statistics;
