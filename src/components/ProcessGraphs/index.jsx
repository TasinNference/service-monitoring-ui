import moment from 'moment';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import queryApi from '../../configs/queryApi';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
} from 'chart.js';
import BarGraph from '../BarGraph';
import { Divider } from '@mui/material';
import axios from '../../configs/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const ProcessGraphs = memo(({ dateTime, machine }) => {
  const [maxVal, setMaxVal] = useState(0);
  const maxValRef = useRef(0);
  const [rightPadding, setRightPadding] = useState(0);
  const chartsArr = ['proc_by_cpu_percent', 'proc_by_memory_percent'];
  const [chartData, setChartData] = useState(null);
  const diff = dateTime.diff(moment(), 'm');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queries = chartsArr.map(async (item) => {
      console.log('queries');
      const rowsArr = [];
      try {
        const response = (
          await axios.post('/', {
            measurement: item,
            machine_name: machine.machine_name,
            start: diff !== 0 ? `${diff * 60}s` : '-15s',
            stop: diff !== 0 ? `${diff * 60 + 15}s` : 'now()'
          })
        ).data;

        for (const item of response) {
          rowsArr.push(item);
        }
      } catch (error) {
        console.log(error);
      }
      return rowsArr;
    });

    const getData = async () => {
      const data = await Promise.all(queries);
      setChartData(
        data?.map((item) => ({
          labels: item.map((p) => p._field),
          datasets: [
            {
              barPercentage: 0.3,
              categoryPercentage: 1,
              backgroundColor: '#57c05e',
              data: item.map((p) => {
                if (p._value > maxValRef.current) maxValRef.current = p._value;
                return Math.round(p._value * 10) / 10;
              })
            }
          ]
        }))
      );
      setLoading(false);
      setMaxVal(maxValRef.current);
    };
    getData();
  }, [dateTime]);

  return (
    <>
      {(!loading && chartData[0] && chartData[0]?.datasets[0]?.data?.length) >
        0 && (
        <div
          style={{
            padding: '25px',
            display: 'grid',
            rowGap: '50px'
          }}
        >
          {chartsArr.map((item, index) => {
            return (
              chartData && (
                <>
                  <BarGraph
                    title={item}
                    data={chartData[index]}
                    rightPadding={rightPadding}
                    setRightPadding={setRightPadding}
                    maxVal={maxVal}
                  />
                  {index === 0 && <Divider />}
                </>
              )
            );
          })}
        </div>
      )}
      {!loading &&
        (!chartData[0] || chartData[0]?.datasets[0]?.data?.length === 0) && (
          <div
            style={{
              height: '100px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div>No Data</div>
          </div>
        )}
    </>
  );
});

export default ProcessGraphs;
