import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ExpenseDonutChart = ({ breakdown }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!breakdown || Object.keys(breakdown).length === 0) return;

        // Clean up previous SVG to avoid duplicates on re-renders
        d3.select(svgRef.current).selectAll('*').remove();

        // Data preparation
        const data = Object.entries(breakdown)
            .filter(([_, val]) => val > 0)
            .map(([key, value]) => ({ label: key, value }));

        if (data.length === 0) return;

        // Chart dimensions
        const width = 300;
        const height = 300;
        const margin = 20;

        const radius = Math.min(width, height) / 2 - margin;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Color scale mapping to Tailwind classes used elsewhere
        const colorMap = {
            'Fuel': '#38bdf8',       // sky-400
            'Maintenance': '#fbbf24',// amber-400
            'Misc': '#94a3b8',       // slate-400
            'Driver Payments': '#f43f5e', // rose-500
            'Other': '#94a3b8'       // slate-400
        };

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(data.map(d => colorMap[d.label] || '#94a3b8'));

        // Compute the position of each group on the pie
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null); // original order

        const data_ready = pie(data);

        // Arc generators
        const arc = d3.arc()
            .innerRadius(radius * 0.65)
            .outerRadius(radius)
            .cornerRadius(6);

        const hoverArc = d3.arc()
            .innerRadius(radius * 0.65)
            .outerRadius(radius * 1.08)
            .cornerRadius(6);

        // Build the pie chart
        const paths = svg
            .selectAll('path')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label))
            .attr('stroke', '#0b1120') // Match background for gap effect
            .style('stroke-width', '4px')
            .style('opacity', 0.8)
            .style('cursor', 'pointer')
            .style('transition', 'opacity 0.2s');

        // Add Tooltip container
        const tooltip = d3.select('body').append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', '#0b1120')
            .style('color', '#fff')
            .style('padding', '10px 14px')
            .style('border', '1px solid rgba(255,255,255,0.1)')
            .style('border-radius', '8px')
            .style('pointer-events', 'none')
            .style('font-size', '13px')
            .style('font-weight', '600')
            .style('box-shadow', '0 8px 30px rgba(0,0,0,0.5)')
            .style('opacity', 0)
            .style('z-index', 100);

        // Interactive Label in Center
        const centerText = svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', '#fff')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .style('font-family', 'ui-sans-serif, system-ui, sans-serif')
            .text('Expenses');

        const centerSubText = svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('y', 22)
            .style('fill', 'rgba(255,255,255,0.5)')
            .style('font-size', '12px')
            .style('font-family', 'ui-sans-serif, system-ui, sans-serif')
            .text('Hover to view');

        // Interaction
        paths
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', hoverArc)
                    .style('opacity', 1)
                    .style('filter', `drop-shadow(0 0 12px ${color(d.data.label)}80)`);

                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color(d.data.label)};"></span>
                        <span style="color: rgba(255,255,255,0.7);">${d.data.label}</span>
                    </div>
                    <div style="margin-top: 4px; font-size: 16px; font-family: monospace;">₹${d.data.value.toLocaleString()}</div>
                `)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 30) + 'px');

                // Update center text dynamically
                centerText.text(d.data.label).style('fill', color(d.data.label));
                centerSubText.text(`₹${d.data.value.toLocaleString()}`).style('fill', '#fff').style('font-weight', 'bold');
            })
            .on('mousemove', function (event) {
                tooltip
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 30) + 'px');
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arc)
                    .style('opacity', 0.8)
                    .style('filter', 'none');

                tooltip.transition().duration(200).style('opacity', 0);

                // Reset center text
                centerText.text('Expenses').style('fill', '#fff');
                centerSubText.text('Hover to view').style('fill', 'rgba(255,255,255,0.5)').style('font-weight', 'normal');
            });

        // Initial Entry Animation
        paths.transition()
            .duration(1000)
            .attrTween('d', function (d) {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, Object.assign({}, d));
                return function (t) {
                    return arc(i(t));
                };
            });

        return () => {
            // Cleanup tooltips from body
            d3.selectAll('.d3-tooltip').remove();
        };

    }, [breakdown]);

    return (
        <div className="flex justify-center items-center w-full h-full min-h-[350px]">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default ExpenseDonutChart;
