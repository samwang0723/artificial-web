import RateBadge from './RateBadge';
import NumberDisplay from './NumberDisplay';
import CategoryDisplay from './CategoryDisplay';
import CloseDisplay from './CloseDisplay';
import CandleStickBar from './CandleStickBar';
import Calendar from '../stock/Calendar';
import Alert from '../general/Alert';
import { useEffect, useState } from 'react';
import { formatDate } from '../utils/date';
import { jarvisApi } from '../../features/apis/jarvisApi';
import { V1ListSelectionResponse } from '../../features/apis/jarvisApi';

const AnalysisTable = ({ title, subtitle }) => {
  const today = new Date();
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [data, setData] = useState<V1ListSelectionResponse | null>(null);
  const [selectionApi] = jarvisApi.useJarvisV1ListSelectionsMutation();

  const handleDateChange = (date) => {
    const formattedDate = formatDate(date);
    setSelectedDate(formattedDate);
  };

  const fetchSelections = async () => {
    try {
      const selectionData = await selectionApi({
        v1ListSelectionRequest: {
          date: selectedDate,
          strict: false,
        },
      }).unwrap();

      if (!selectionData.entries || selectionData.entries.length === 0) {
        return;
      }

      setData(selectionData);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    fetchSelections();
  }, [selectedDate]);

  return (
    <div className="max-w-[85rem] px-1 py-2 sm:px-6 lg:px-3 lg:py-3 mx-auto">
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-start items-start md:items-center">
                  <div className="mb-2 mr-6 md:mb-0">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  </div>
                  <Calendar onDateChange={handleDateChange} />
                </div>
              </div>
              {error && (
                <div className="flex mt-4 ml-4 mb-4">
                  <Alert show={true} onDismiss={() => {}}>
                    <span className="font-semibold">Error: </span>Unable to fetch daily analysis
                  </Alert>
                </div>
              )}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-start whitespace-nowrap "
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Rate
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-start whitespace-nowrap "
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Stock
                      </span>
                    </th>

                    <th
                      scope="col"
                      className="px-1 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Close
                      </span>
                    </th>

                    <th
                      scope="col"
                      className="px-1 py-3 text-start whitespace-nowrap pr-3"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Volume
                      </span>
                    </th>

                    <th
                      scope="col"
                      className="px-3 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        1 Day
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        5 Day
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        10 Day
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        20 Day
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        60 Day
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Trust
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Trust 10
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Foreign
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Foreign 10
                      </span>
                    </th>

                    <th
                      scope="col"
                      className="px-1 py-3 text-start whitespace-nowrap"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                        Industry
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data && data.entries && data.entries.length > 0 ? (
                    data.entries.map((stock) => (
                      <tr key={stock.stockID}>
                        <td className="h-px w-px whitespace-nowrap px-2 py-3">
                          <RateBadge analysis={stock} />
                        </td>

                        <td className="h-px w-px whitespace-nowrap px-2 py-3">
                          <div className="flex items-center gap-x-1">
                            <div className="grow">
                              <span className="block text-sm w-14 font-semibold text-gray-800 dark:text-white whitespace-normal">
                                {stock.name}
                              </span>
                              <span className="block text-sm text-gray-500">
                                {stock.stockID}
                              </span>
                            </div>
                            <CandleStickBar
                              id={stock.stockID}
                              high={stock.high}
                              low={stock.low}
                              open={stock.open}
                              close={stock.close}
                            />
                          </div>
                        </td>

                        <td className="h-px w-px whitespace-nowrap px-1 py-3">
                          <CloseDisplay
                            close={stock.close}
                            quoteChange={stock.quoteChange}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-1 py-3">
                          <span className="text-sm text-gray-800 dark:text-white">
                            {new Intl.NumberFormat('en-US').format(
                              stock.volume
                            )}
                          </span>
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-3 py-3">
                          <NumberDisplay
                            value={stock.concentration1}
                            percent={true}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-3 py-3">
                          <NumberDisplay
                            value={stock.concentration5}
                            percent={true}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-3 py-3">
                          <NumberDisplay
                            value={stock.concentration10}
                            percent={true}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-2 py-3">
                          <NumberDisplay
                            value={stock.concentration20}
                            percent={true}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-2 py-3">
                          <NumberDisplay
                            value={stock.concentration60}
                            percent={true}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-3 py-3">
                          <NumberDisplay
                            value={stock.trust}
                            percent={false}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-2 py-3">
                          <NumberDisplay
                            value={stock.trust10}
                            percent={false}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-3 py-3">
                          <NumberDisplay
                            value={stock.foreign}
                            percent={false}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-2 py-3">
                          <NumberDisplay
                            value={stock.foreign10}
                            percent={false}
                            size={'xs'}
                          />
                        </td>
                        <td className="h-px w-px whitespace-nowrap px-1 py-3">
                          <CategoryDisplay text={stock.category} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisTable;
