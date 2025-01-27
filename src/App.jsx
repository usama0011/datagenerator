import React, { useState } from "react";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";

import axios from "axios";
import {
  Table,
  Button,
  Form,
  DatePicker,
  message,
  Spin,
  Input,
  Row,
  Col,
  InputNumber,
} from "antd";
import dayjs from "dayjs";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignData, setCampaignData] = useState([]);
  const [reportingData, setReportingData] = useState([]);

  const generateRandomCostPerResult = () => {
    return (Math.random() * (0.55 - 0.15) + 0.15).toFixed(2);
  };

  const calculateAmountSpent = (linkClicks, costPerResult) => {
    return (linkClicks * costPerResult).toFixed(2);
  };

  const fetchCampaignData = async ({
    from,
    to,
    staticData,
    timezoneId,
    offerId,
    affiliateId,
  }) => {
    setLoading(true);
    const payload = {
      timezone_id: timezoneId,
      currency_id: "USD",
      from: from.format("YYYY-MM-DD"),
      to: to.format("YYYY-MM-DD"),
      columns: [
        { column: "offer" },
        { column: "affiliate" },
        { column: "date" },
      ],
      usm_columns: [],
      query: {
        filters: [
          { resource_type: "offer", filter_id_value: String(offerId) },
          { resource_type: "affiliate", filter_id_value: String(affiliateId) },
        ],
        exclusions: [],
        metric_filters: [],
        user_metrics: [],
        settings: {},
      },
    };

    try {
      const response = await axios.post(
        "https://api.eflow.team/v1/networks/reporting/entity",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Eflow-API-Key": process.env.XEflowAPIKey,
          },
        }
      );

      // Format the data
      const formattedData = response.data.table
        .flatMap((row) => {
          // Extract platform name from the 'columns' array
          const platformColumn = row.columns.find(
            (col) => col.column_type === "platform"
          );
          const platform = platformColumn?.label || "IPad"; // Use the 'label' field for platform name

          const linkClicks = row.reporting.total_click;
          // If linkClicks is 0, set all calculated values to 0
          if (linkClicks === 0) {
            return {
              date: dayjs.unix(row.columns[2].label).format("YYYY-MM-DD"),
              platform,
              impressionDevice: "All",
              linkClicks: 0,
              costPerResult: 0,
              amountSpent: 0,
              reach: 0,
              impressions: 0,
              cpm: 0,
              cpc: 0,
              ctr: 0,
              clicksAll: 0,
              ctrAll: 0,
              cpcAll: 0,
              ...staticData,
            };
          }
          const costPerResult = generateRandomCostPerResult();
          const amountSpent = calculateAmountSpent(linkClicks, costPerResult);

          const reachMultiplier =
            Math.floor(Math.random() * (90 - 70 + 1)) + 70;
          const reach = linkClicks * reachMultiplier;

          const impressionsMultiplier = Math.round(
            Math.random() * (4.2 - 2.1) + 2.1
          );
          const impressions = reach * impressionsMultiplier;

          const cpm = ((amountSpent / impressions) * 1000).toFixed(2);
          const cpc = (amountSpent / linkClicks).toFixed(2);
          const ctr = ((linkClicks / impressions) * 100).toFixed(2);

          const clicksAllMultiplier = Math.random() * (1.9 - 1.3) + 1.3;
          const clicksAll = Math.round(linkClicks * clicksAllMultiplier);

          const ctrAll = ((clicksAll / impressions) * 100).toFixed(2);
          const cpcAll = (amountSpent / clicksAll).toFixed(2);

          // Original row with calculated values
          const originalRow = {
            date: dayjs.unix(row.columns[2].label).format("YYYY-MM-DD"),
            platform,
            impressionDevice: "All",
            linkClicks,
            costPerResult,
            amountSpent,
            reach,
            impressions,
            cpm,
            cpc,
            ctr,
            clicksAll,
            ctrAll,
            cpcAll,
            ...staticData, // Add static data to each row
          };

          return [originalRow];
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setCampaignData(formattedData); // For Campaign Data

      message.success("Data fetched successfully!");
    } catch (error) {
      message.error("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  //newtable
  const fetchReportingData = async ({
    from,
    to,
    staticData,
    timezoneId,
    offerId,
    affiliateId,
  }) => {
    setLoading(true);
    const payload = {
      timezone_id: timezoneId,
      currency_id: "USD",
      from: from.format("YYYY-MM-DD"),
      to: to.format("YYYY-MM-DD"),
      columns: [
        { column: "offer" },
        { column: "affiliate" },
        { column: "date" },
        { column: "platform" },
      ],
      usm_columns: [],
      query: {
        filters: [
          { resource_type: "offer", filter_id_value: String(offerId) },
          { resource_type: "affiliate", filter_id_value: String(affiliateId) },
        ],
        exclusions: [],
        metric_filters: [],
        user_metrics: [],
        settings: {},
      },
    };
    const impressionDevices = [
      { name: "Feed", percentage: 0.55 },
      { name: "Facebook Stories", percentage: 0.07 },
      { name: "Facebook Stories", percentage: 0.13 },
      { name: "Marketplace", percentage: 0.19 },
      { name: "Search", percentage: 0.06 },
    ];

    try {
      const response = await axios.post(
        "https://api.eflow.team/v1/networks/reporting/entity",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Eflow-API-Key": process.env.XEflowAPIKey,
          },
        }
      );

      // Format the data
      const formattedData = response.data.table
        .flatMap((row) => {
          // Extract platform name from the 'columns' array
          const platformColumn = row.columns.find(
            (col) => col.column_type === "platform"
          );
          const platform = platformColumn?.label || "IPad"; // Use the 'label' field for platform name

          const linkClicks = row.reporting.total_click;
          // If linkClicks is 0, set all calculated values to 0
          if (linkClicks === 0) {
            return {
              date: dayjs.unix(row.columns[2].label).format("YYYY-MM-DD"),
              platform,
              impressionDevice: "All",
              linkClicks: 0,
              costPerResult: 0,
              amountSpent: 0,
              reach: 0,
              impressions: 0,
              cpm: 0,
              cpc: 0,
              ctr: 0,
              clicksAll: 0,
              ctrAll: 0,
              cpcAll: 0,
              ...staticData,
            };
          }
          const costPerResult = generateRandomCostPerResult();
          const amountSpent = calculateAmountSpent(linkClicks, costPerResult);

          const reachMultiplier =
            Math.floor(Math.random() * (90 - 70 + 1)) + 70;
          const reach = linkClicks * reachMultiplier;

          const impressionsMultiplier = Math.round(
            Math.random() * (4.2 - 2.1) + 2.1
          );
          const impressions = reach * impressionsMultiplier;

          const cpm = ((amountSpent / impressions) * 1000).toFixed(2);
          const cpc = (amountSpent / linkClicks).toFixed(2);
          const ctr = ((linkClicks / impressions) * 100).toFixed(2);

          const clicksAllMultiplier = Math.random() * (1.9 - 1.3) + 1.3;
          const clicksAll = Math.round(linkClicks * clicksAllMultiplier);

          const ctrAll = ((clicksAll / impressions) * 100).toFixed(2);
          const cpcAll = (amountSpent / clicksAll).toFixed(2);

          // Original row with calculated values
          const originalRow = {
            date: dayjs.unix(row.columns[2].label).format("YYYY-MM-DD"),
            platform,
            impressionDevice: "All",
            linkClicks,
            costPerResult,
            amountSpent,
            reach,
            impressions,
            cpm,
            cpc,
            ctr,
            clicksAll,
            ctrAll,
            cpcAll,
            ...staticData, // Add static data to each row
          };
          const extraRows = impressionDevices.map((device) => {
            const linkClicksDistributed = Math.round(
              linkClicks * device.percentage
            );
            const amountSpentDistributed = parseFloat(
              (amountSpent * device.percentage).toFixed(2)
            );
            const reachDistributed = Math.round(reach * device.percentage);
            const impressionsDistributed = Math.round(
              impressions * device.percentage
            );

            // Calculating CPM, CPC, CTR, ClicksAll, CTRAll, and CPCAll
            const cpmDistributed =
              impressionsDistributed > 0
                ? (
                    (amountSpentDistributed / impressionsDistributed) *
                    1000
                  ).toFixed(2)
                : 0;
            const cpcDistributed =
              linkClicksDistributed > 0
                ? (amountSpentDistributed / linkClicksDistributed).toFixed(2)
                : 0;
            const ctrDistributed =
              impressionsDistributed > 0
                ? (
                    (linkClicksDistributed / impressionsDistributed) *
                    100
                  ).toFixed(2)
                : 0;

            const clicksAllMultiplier = Math.random() * (1.9 - 1.3) + 1.3;
            const clicksAllDistributed = Math.round(
              linkClicksDistributed * clicksAllMultiplier
            );

            const ctrAllDistributed =
              impressionsDistributed > 0
                ? (
                    (clicksAllDistributed / impressionsDistributed) *
                    100
                  ).toFixed(2)
                : 0;
            const cpcAllDistributed =
              clicksAllDistributed > 0
                ? (amountSpentDistributed / clicksAllDistributed).toFixed(2)
                : 0;
            const costPerResultDistributed =
              linkClicksDistributed > 0
                ? (amountSpentDistributed / linkClicksDistributed).toFixed(2)
                : 0;

            return {
              date: dayjs.unix(row.columns[2].label).format("YYYY-MM-DD"),
              pageID: staticData.pageID || row.pageID || "N/A",
              pageName: staticData.pageName || row.pageName || "N/A",
              campaignName:
                staticData.campaignName || row.campaignName || "N/A",
              adSetName: staticData.adSetName || row.adSetName || "N/A",
              adName: staticData.adName || row.adName || "N/A",
              campaignLink:
                staticData.campaignLink || row.campaignLink || "N/A",
              pageImageLink:
                staticData.pageImageLink || row.pageImageLink || "N/A",
              campaignImageLink:
                staticData.campaignImageLink || row.campaignImageLink || "N/A",
              delivery: staticData.delivery || row.delivery || "N/A",
              bidStrategy: staticData.bidStrategy || row.bidStrategy || "N/A",
              budget: staticData.budget || row.budget || "N/A",
              attributionSettings:
                staticData.attributionSettings ||
                row.attributionSettings ||
                "N/A",
              ends: staticData.ends || row.ends || "N/A",
              schedule: staticData.schedule || row.schedule || "N/A",
              frequency: staticData.frequency || row.frequency || "N/A",
              platform,
              impressionDevice: device.name,
              linkClicks: linkClicksDistributed,
              amountSpent: amountSpentDistributed,
              reach: reachDistributed,
              impressions: impressionsDistributed,
              cpm: cpmDistributed,
              cpc: cpcDistributed,
              ctr: ctrDistributed,
              clicksAll: clicksAllDistributed,
              ctrAll: ctrAllDistributed,
              cpcAll: cpcAllDistributed,
              costPerResult: costPerResultDistributed,
            };
          });

          return [originalRow, ...extraRows];
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setReportingData(formattedData); // For Reporting Data

      message.success("Data fetched successfully!");
    } catch (error) {
      message.error("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "date",
    },
    {
      title: "Page ID",
      dataIndex: "pageID",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "pageID",
    },
    {
      title: "Page Name",
      dataIndex: "pageName",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "pageName",
    },
    {
      title: "Current Switch",
      dataIndex: "currentSwitch",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "currentSwitch",
      render: (value) => (value ? "True" : "False"),
    },
    {
      title: "Campaign Name",
      dataIndex: "campaignName",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "campaignName",
    },
    {
      title: "Ad Set Name",
      dataIndex: "campaignName",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "campaignName",
    },
    {
      title: "Ad Name",
      dataIndex: "campaignName",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "campaignName",
    },
    {
      title: "Campaign Link",
      dataIndex: "campaignLink",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "campaignLink",
    },
    {
      title: "Page Image Link",
      dataIndex: "pageImageLink",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "pageImageLink",
    },
    {
      title: "Campaign Image Link",
      dataIndex: "campaignImageLink",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "campaignImageLink",
    },
    {
      title: "Delivery",
      dataIndex: "delivery",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "delivery",
    },
    {
      title: "Bid Strategy",
      dataIndex: "bidStrategy",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "bidStrategy",
    },
    {
      title: "Budget",
      dataIndex: "budget",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "budget",
    },
    {
      title: "Attribution Settings",
      dataIndex: "attributionSettings",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "attributionSettings",
    },
    {
      title: "Ends",
      dataIndex: "ends",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "ends",
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "schedule",
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "frequency",
    },
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
        },
      }),
      render: (value) => {
        // Define colors for each platform
        const platformColors = {
          Android: "brown", // Blue
          Windows: "green", // Pink
          iOS: "orange", // Light blue
          macOS: "blue", // Dark blue
          Unknown: "red", // Black
        };

        // Get the color for the platform, default to gray if not specified
        const color = platformColors[value] || platformColors.Default;

        return (
          <span style={{ color: color, fontWeight: "bold" }}>
            {value || "N/A"}
          </span>
        );
      },
    },

    {
      title: "Impression Device",
      dataIndex: "impressionDevice",
      key: "impressionDevice",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f",
          color: "white",
          fontWeight: "bold",
        },
      }),
      render: (value) => {
        // Define colors for each impression device
        const impressionDeviceColors = {
          Feed: "#1E90FF", //
          "Facebook Stories": "#FF69B4", // Pink
          Marketplace: "#32CD32", // Green
          Search: "#FFD700", // Yellow
          Default: "#808080", // Gray
        };

        // Get the color for the impression device, default to gray if not specified
        const color =
          impressionDeviceColors[value] || impressionDeviceColors.Default;

        return (
          <span style={{ color: color, fontWeight: "bold" }}>
            {value || "N/A"}
          </span>
        );
      },
    },

    {
      title: "Link Clicks",
      dataIndex: "linkClicks",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "linkClicks",
    },
    {
      title: "Cost Per Result ($)",
      dataIndex: "costPerResult",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "costPerResult",
    },
    {
      title: "Amount Spent ($)",
      dataIndex: "amountSpent",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "amountSpent",
    },
    {
      title: "Results",
      dataIndex: "linkClicks",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "results",
      render: (value) => value,
    },
    {
      title: "Reach",
      dataIndex: "reach",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "reach",
      render: (value) => value, // Use pre-calculated value
    },
    {
      title: "Impressions",
      dataIndex: "impressions",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "impressions",
      render: (value) => value, // Use pre-calculated value
    },
    {
      title: "CPM ($)",
      dataIndex: "cpm",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "cpm",
      render: (value) => value, // Use pre-calculated value
    },
    {
      title: "CPC ($)",
      dataIndex: "cpc",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "cpc",
      render: (value) => value, // Use pre-calculated value
    },
    {
      title: "CTR (%)",
      dataIndex: "ctr",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "ctr",
      render: (value) => value, // Use pre-calculated value
    },
    {
      title: "ClicksAll",
      dataIndex: "clicksAll",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "clicksAll",
      render: (value) => value, // Use pre-calculated value
    },
    {
      title: "CTRAll (%)",
      dataIndex: "ctrAll",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "ctrAll",
    },
    {
      title: "CPCAll ($)",
      dataIndex: "cpcAll",
      onHeaderCell: () => ({
        style: {
          minWidth: 200,
          backgroundColor: "#3f3f3f", // Light gray background
          color: "white", // Blue text
          fontWeight: "bold", // Bold text
          // Center align text
        },
      }),
      key: "cpcAll",
    },
  ];

  const campaignColumns = columns.filter(
    (col) => col.key !== "platform" && col.key !== "impressionDevice"
  );

  const reportingColumns = [...columns]; // Includes all fields

  const onFinish = (values) => {
    const { rangePicker, timezoneId, offerId, affiliateId, ...restFields } =
      values;

    if (!rangePicker || rangePicker.length !== 2) {
      message.error("Please select a valid date range!");
      return;
    }

    const [from, to] = rangePicker;

    // Convert timezoneId to a number
    const timezoneIdNumber = Number(timezoneId);
    const offerIdNumber = Number(offerId);
    const affiliateIdNumber = Number(affiliateId);

    // Validate that they are numbers
    if (
      isNaN(timezoneIdNumber) ||
      isNaN(offerIdNumber) ||
      isNaN(affiliateIdNumber)
    ) {
      message.error(
        "Invalid inputs. Please enter valid numbers for all fields."
      );
      return;
    }

    const staticData = { ...restFields };

    fetchCampaignData({
      from,
      to,
      timezoneId: timezoneIdNumber,
      offerId: offerIdNumber,
      affiliateId: affiliateIdNumber,
      staticData,
    });

    fetchReportingData({
      from,
      to,
      timezoneId: timezoneIdNumber,
      offerId: offerIdNumber,
      affiliateId: affiliateIdNumber,
      staticData,
    });
  };
  const downloadCampaignCSV = () => {
    if (!campaignData || campaignData.length === 0) {
      message.warning("No campaign data available to download!");
      return;
    }

    try {
      const csv = unparse(campaignData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "campaign_data.csv");
      message.success("Campaign CSV downloaded successfully!");
    } catch (error) {
      console.error("Error during Campaign CSV generation:", error);
      message.error("Failed to download Campaign CSV.");
    }
  };

  const downloadReportingCSV = () => {
    if (!reportingData || reportingData.length === 0) {
      message.warning("No reporting data available to download!");
      return;
    }

    try {
      const csv = unparse(reportingData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "reporting_data.csv");
      message.success("Reporting CSV downloaded successfully!");
    } catch (error) {
      console.error("Error during Reporting CSV generation:", error);
      message.error("Failed to download Reporting CSV.");
    }
  };
  // Step 2: Filter Data for Campaign Table
  const getFilteredCampaignData = (data) => {
    return data.map((item) => {
      const { platform, impressionDevice, ...rest } = item; // Exclude these fields
      return rest;
    });
  };

  return (
    <div className="everflow-container">
      <h1 className="everflow-header">Everflow Reporting</h1>
      <div style={{ marginBottom: "16px", textAlign: "right" }}>
        <Button type="primary" onClick={downloadCampaignCSV}>
          Download Campaign CSV
        </Button>
      </div>
      {/* Reporting CSV Button */}
      <div style={{ margin: "16px 0", textAlign: "right" }}>
        <Button type="primary" onClick={downloadReportingCSV}>
          Download Reporting CSV
        </Button>
      </div>
      <Form onFinish={onFinish} layout="vertical" className="everflow-form">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="offerId"
              label="Offer ID"
              rules={[
                { required: true, message: "Please enter a valid Offer ID!" },
              ]}
            >
              <InputNumber
                placeholder="Enter Offer ID"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="affiliateId"
              label="Affiliate ID"
              rules={[
                {
                  required: true,
                  message: "Please enter a valid Affiliate ID!",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter Affiliate ID"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="rangePicker"
              label="Select Date Range"
              rules={[
                { required: true, message: "Please select a date range!" },
              ]}
            >
              <DatePicker.RangePicker format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="pageID"
              label="Page ID"
              rules={[{ required: true, message: "Please enter the Page ID!" }]}
            >
              <Input placeholder="Enter Page ID" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="pageName"
              label="Page Name"
              rules={[
                { required: true, message: "Please enter the Page Name!" },
              ]}
            >
              <Input placeholder="Enter Page Name" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="currentSwitch"
              label="Current Switch"
              valuePropName="checked"
            >
              <Input type="checkbox" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="campaignName"
              label="Campaign Name"
              rules={[
                { required: true, message: "Please enter the Campaign Name!" },
              ]}
            >
              <Input placeholder="Enter Campaign Name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="campaignLink"
              label="Campaign Link"
              rules={[
                { required: true, message: "Please enter the Campaign Link!" },
              ]}
            >
              <Input placeholder="Enter Campaign Link" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="pageImageLink" label="Page Image Link">
              <Input placeholder="Enter Page Image Link" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="campaignImageLink" label="Campaign Image Link">
              <Input placeholder="Enter Campaign Image Link" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="delivery" label="Delivery">
              <Input placeholder="Enter Delivery Info" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="bidStrategy" label="Bid Strategy">
              <Input placeholder="Enter Bid Strategy" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="budget" label="Budget">
              <Input placeholder="Enter Budget" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="attributionSettings" label="Attribution Settings">
              <Input placeholder="Enter Attribution Settings" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="ends" label="Ends">
              <Input placeholder="Enter End Date" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="schedule" label="Schedule">
              <Input placeholder="Enter Schedule" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="frequency" label="Frequency">
              <Input placeholder="Enter Frequency" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="timezoneId"
              label="Timezone ID"
              rules={[
                {
                  required: true,
                  message: "Please enter a valid Timezone ID!",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter Timezone ID"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ width: "100%" }}>
          <Button
            style={{ width: "100%" }}
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            {loading ? <Spin /> : "Fetch Data"}
          </Button>
        </Form.Item>
      </Form>

      <h2>Campaign Table</h2>
      <div className="eveflowtablecontainer">
        <Table
          dataSource={getFilteredCampaignData(campaignData)} // Pass filtered data
          columns={campaignColumns} // Use filtered columns
          pagination={false}
          rowKey={(record, index) => `${record.date}-${index}`}
          className="everflow-table"
        />
      </div>
      <h2>Reporting Table</h2>
      <div className="eveflowtablecontainer">
        <Table
          dataSource={reportingData}
          columns={columns}
          pagination={false}
          rowKey={(record, index) => `${record.date}-${index}`}
          className="everflow-table"
        />
      </div>
    </div>
  );
};

export default App;

// Feed 55%
// Facebook Stories	 7%
// Facebook Stories	 13%
// Marketplace	 19%
// Search	6%

// Link Clicks , Amount spent , Results, Reach and Impressions
//
