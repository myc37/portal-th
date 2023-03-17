import React, { Component } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsBarProps {
  analyticsResults: any;
  confidence: number;
  currentVideoKey: string | undefined;
  currentVideoFps: number;
  useDarkTheme: boolean;
  /* Callbacks Package */
  callbacks: any;
}

export default class AnalyticsBar extends Component<AnalyticsBarProps> {
  constructor(props: AnalyticsBarProps) {
    super(props);
  }

  render(): JSX.Element {
    const data = this.props.analyticsResults[
      this.props.currentVideoKey ?? ""
    ] ?? [[]];

    const displayData = Object.values(data)
      .map((arr: any) =>
        arr
          .filter((doc: any) => doc.confidence >= this.props.confidence)
          .map((doc: any) => doc.tag.name)
          .reduce(
            (a: Record<string, number>, b: string) =>
              b in a ? { ...a, [b]: a[b] + 1 } : { ...a, [b]: 1 },
            {}
          )
      )
      .map((doc: any, index: number) => {
        return {
          ...doc,
          time: index / this.props.currentVideoFps,
        };
      });

    const tickFormatter = (tick: any) => {
      const date = new Date(0);
      date.setSeconds(tick);
      const hhmmssString = date.toISOString().substring(11, 19);
      return hhmmssString;
    };

    const uniqueKeys: Set<string> = displayData.reduce(
      (a: Set<string>, b: Record<string, number>) =>
        new Set([...a, ...Object.keys(b)]),
      new Set<string>()
    );
    uniqueKeys.delete("time");

    return (
      <div style={{ width: "100%", height: 100 }}>
        <ResponsiveContainer>
          <LineChart
            data={displayData}
            onMouseDown={() => this.props.callbacks.pauseVideo()}
            onClick={state => {
              this.props.callbacks.panVideo(state.activeLabel);
            }}
            onMouseUp={() => this.props.callbacks.resumeVideo()}
          >
            <YAxis
              tick={{
                fill: this.props.useDarkTheme ? "white" : undefined,
                fontSize: "11px",
              }}
            />
            <XAxis
              dataKey="time"
              interval={this.props.currentVideoFps - 1}
              tickFormatter={tickFormatter}
              tick={{
                fill: this.props.useDarkTheme ? "white" : undefined,
                fontSize: "11px",
              }}
            />
            <Tooltip
              labelStyle={{ color: "black" }}
              labelFormatter={label => `Time: ${label}s`}
              contentStyle={{ fontSize: "11px" }}
              cursor={false}
            />
            {Array.from(uniqueKeys).map(key => {
              return <Line type="monotone" dataKey={key} key={key} />;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
