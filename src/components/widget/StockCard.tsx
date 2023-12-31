import { useGetStockPriceQuery } from '../../features/apis/finMindApi';
import { useGetIndexPriceQuery } from '../../features/apis/misApi';
import { useRef, useEffect } from 'react';
import { createChart } from 'lightweight-charts';
import { formatDate, getDateTwoMonthsAgo } from '../utils/date';
import PriceBadge from '../stock/PriceBadge';

const red = 'rgba(249, 40, 85, 1.0)';
const green = 'rgba(45, 192, 142, 1.0)';
const gridColor = '#1E1E1E';
const CHART_HEIGHT = 180;

const parseStockData = (stockData) => {
  if (!stockData) {
    return [];
  }

  return stockData.map((item) => {
    // Return a new object with only the required fields
    return {
      timestamp: item.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
      open: item.open ? item.open : item.Open,
      high: item.max ? item.max : item.High,
      low: item.min ? item.min : item.Low,
      close: item.close ? item.close : item.Close,
      volume: item.Trading_money ? item.Trading_money : item.Volume,
      turnover: item.Trading_turnover ? item.Trading_turnover : 0,
    };
  });
};

// identify highest and lowest price from data loop
// and attach marker on series
const markHighLow = (series, data) => {
  let highest = data[0];
  let lowest = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i].high > highest.high) {
      highest = data[i];
    }
    if (data[i].low < lowest.low) {
      lowest = data[i];
    }
  }
  const mData = [
    {
      time: highest.timestamp,
      position: 'aboveBar',
      color: 'lightgrey',
      shape: 'arrowDown',
      text: String(highest.high),
    },
    {
      time: lowest.timestamp,
      position: 'belowBar',
      color: 'lightgrey',
      shape: 'arrowUp',
      text: String(lowest.low),
    },
  ];
  mData.sort((a, b) => {
    if (a.time < b.time) {
      return -1;
    }
    return 0;
  });
  series.setMarkers(mData);
};

// This function calculates a simple moving average for the given period
const calculateMA = (data, period) => {
  let ma = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    ma.push({ time: data[i].time, value: sum / period });
  }
  return ma;
};

const getIndexKey = (id) => {
  switch (id) {
    case 'TAIEX':
      return 'tse_t00.tw';
    case 'TPEx':
      return 'otc_o00.tw';
    default:
      return '';
  }
};

const StockCard = ({ id, name, dataset = 'TaiwanStockPrice' }) => {
  const indexKey = getIndexKey(id);
  const { data: indexData } = useGetIndexPriceQuery(indexKey);

  const today = new Date();
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRlIjoiMjAyMy0xMi0yNyAxMDo1MDozNyIsInVzZXJfaWQiOiJzYW13YW5nMDcyMyIsImlwIjoiMTE0LjQxLjc0LjEwMCJ9.1myIcMA0InqyuG9zQleSkhU-wRf3DVQox5GUVJy8xVQ';
  const { data } = useGetStockPriceQuery({
    dataset,
    data_id: id, //'TAIEX',
    start_date: getDateTwoMonthsAgo(today, '-', 40),
    end_date: formatDate(today, '-'),
    token,
  });

  const fdata = parseStockData(data);
  fdata.sort((a: { timestamp: number }, b: { timestamp: number }) => {
    if (a.timestamp < b.timestamp) {
      return -1;
    }
    return 0;
  });

  if (
    indexData &&
    indexData.length > 0 && fdata.length > 0 &&
    indexData[0].d.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') !==
      fdata[fdata.length - 1].timestamp
  ) {
    let source = indexData[0];
    fdata.push({
      timestamp: source.d.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
      open: parseFloat(source.o),
      high: parseFloat(source.h),
      low: parseFloat(source.l),
      close: parseFloat(source.z),
      volume: parseInt(source.v, 10) * 1000000,
    });
  }

  const chartContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chartContainerRef.current && fdata.length > 0) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: CHART_HEIGHT,
        handleScroll: false,
        handleScale: false,
        layout: {
          fontSize: 9,
          textColor: 'white',
          background: { color: 'black' },
        },
        grid: {
          vertLines: {
            color: gridColor,
          },
          horzLines: {
            color: gridColor,
          },
        },
        leftPriceScale: {
          borderColor: gridColor,
          visible: true,
        },
        rightPriceScale: {
          visible: false,
        },
        timeScale: {
          borderColor: gridColor,
          rightOffset: 2,
          fixLeftEdge: true,
          ticksVisible: true,
        },
      });

      // configure precision with different price.
      let precision = 2;
      const lastClose = fdata[0].close;
      if (lastClose >= 100 && lastClose < 500) {
        precision = 1;
      } else if (lastClose >= 500) {
        precision = 0;
      }
      const candleSeries = chart.addCandlestickSeries({
        upColor: red,
        downColor: green,
        borderDownColor: green,
        borderUpColor: red,
        wickDownColor: green,
        wickUpColor: red,
        priceScaleId: 'left',
      });
      candleSeries.priceScale().applyOptions({
        scaleMargins: {
          // positioning the price scale for the area series
          top: 0.03,
          bottom: 0.22,
        },
      });
      candleSeries.applyOptions({
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => {
            return price.toFixed(precision);
          },
        },
      });
      markHighLow(candleSeries, fdata);

      const volumeSeries = chart.addHistogramSeries({
        color: '#5D5D5D',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        priceLineVisible: false,
        lastValueVisible: false,
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // highest point of the series will be 70% away from the top
          bottom: 0,
        },
      });

      // Convert the data to the format required by Lightweight Charts
      const candlestickData = fdata.map((item) => ({
        time: item.timestamp, // assuming the timestamp is in milliseconds
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      const volumeData = fdata.map((item: { timestamp: any; volume: any }) => ({
        time: item.timestamp, // assuming the timestamp is in milliseconds
        value: item.volume,
      }));

      candleSeries.setData(candlestickData);
      volumeSeries.setData(volumeData);

      // Add MA lines using line series
      const ma8Series = chart.addLineSeries({
        color: 'orange',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const ma21Series = chart.addLineSeries({
        color: 'lightblue',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const ma55Series = chart.addLineSeries({
        color: 'lightgreen',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      // Calculate and set data for the MAs
      ma8Series.setData(calculateMA(candlestickData, 8));
      ma21Series.setData(calculateMA(candlestickData, 21));
      ma55Series.setData(calculateMA(candlestickData, 55));

      chart.timeScale().fitContent();

      return () => {
        chart.remove();
      };
    }
  }, [id, fdata]);

  const index = fdata.length - 1;
  if (index < 0) return <div></div>;
  const closeTag = fdata[fdata.length - 1].close;
  const diff = +(
    fdata[fdata.length - 1].close - fdata[fdata.length - 2].close
  ).toFixed(2);
  const diffPercent = +((diff / fdata[fdata.length - 2].close) * 100).toFixed(
    2
  );

  // price color if diff contains +,use red,otherwise use green
  return (
    <div className="border border-black p-1 bg-black rounded-lg w-64">
      <div className="flex justify-start mb-1 mt-2">
        <div className="text-white text-md text-sm truncate pl-3">{name}</div>
        <span className="text-xs text-gray-500 pl-1 pt-1">{id}</span>
      </div>
      <div className="flex justify-between gap-1 text-xs mr-2 ml-2 mb-1">
        <PriceBadge
          close={closeTag}
          diff={diff}
          diffPercent={diffPercent.toString() + '%'}
        />
      </div>
      <div ref={chartContainerRef} id={id} />
    </div>
  );
};

export default StockCard;
