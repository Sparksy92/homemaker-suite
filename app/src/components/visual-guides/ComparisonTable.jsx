import React from 'react';

const ComparisonTable = ({ headers = [], rows = [], keys = [] }) => {
    return (
        <div className="overflow-x-auto my-8 rounded-2xl shadow-sm border border-sand-300">
            <table className="w-full text-left border-collapse bg-white">
                <thead className="bg-sage-700 text-sand-100">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="px-5 py-3.5 font-serif font-black text-xs uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                    {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-sand-50/50 transition-colors">
                            {keys.map((k, kIdx) => (
                                <td key={kIdx} className="px-5 py-4 text-xs font-semibold text-charcoal-700 whitespace-normal leading-relaxed">
                                    {row[k]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ComparisonTable;
