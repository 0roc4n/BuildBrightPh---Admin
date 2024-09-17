import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, ApexDataLabels, ApexTheme,
         ApexStates, ApexGrid, ApexForecastDataPoints, ApexYAxis, ApexResponsive, ApexPlotOptions,
         ApexTooltip, ApexFill, ApexNoData, ApexMarkers, ApexLegend, ApexStroke, ApexNonAxisChartSeries,
         ApexAnnotations } from "ng-apexcharts";

export{ ChartInterface }

interface ChartInterface {
  chart              ?: ApexChart;
  annotations        ?: ApexAnnotations;
  colors             ?: any[];
  dataLabels         ?: ApexDataLabels;
  series             ?: ApexAxisChartSeries;
  stroke             ?: ApexStroke;
  labels             ?: string[];
  legend             ?: ApexLegend;
  markers            ?: ApexMarkers;
  noData             ?: ApexNoData;
  fill               ?: ApexFill;
  tooltip            ?: ApexTooltip;
  plotOptions        ?: ApexPlotOptions;
  responsive         ?: ApexResponsive[];
  xaxis              ?: ApexXAxis;
  yaxis              ?: ApexYAxis | ApexYAxis[];
  forecastDataPoints ?: ApexForecastDataPoints;
  grid               ?: ApexGrid;
  states             ?: ApexStates;
  title              ?: ApexTitleSubtitle;
  subtitle           ?: ApexTitleSubtitle;
  theme              ?: ApexTheme;
  autoUpdateSeries   ?: boolean;
}

interface dailyRevenueChart{
  
}
