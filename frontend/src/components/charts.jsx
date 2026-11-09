import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useChartColors } from '../context/AppContext';
export function OutcomeDonut({ delinquent, notDelinquent }) {
    const c = useChartColors();
    const data = [{ name: 'Delinquent', value: delinquent, color: c.risk }, { name: 'Not Delinquent', value: notDelinquent, color: c.safe }];
    return (<div className="flex items-center gap-6">
      <div className="h-36 w-36 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={44} outerRadius={64} paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.name} fill={d.color}/>)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (<li key={d.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }}/><span>{d.name}</span><span className="ml-1 font-medium">{d.value}</span></li>))}
      </ul>
    </div>);
}
export const tooltipStyle = (c) => ({
    contentStyle: { background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 6, fontSize: 12 },
    labelStyle: { color: c.text },
});
