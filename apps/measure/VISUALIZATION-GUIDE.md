# Bundle Analyzer - Visualization Guide

The bundle analyzer generates two CSV formats for different visualization needs.

## Output Files

1. **`bundle-analysis.csv`** - Flat table with detailed per-module data
2. **`bundle-analysis-tree.csv`** - Hierarchical tree structure for visualizations

## Visualizing the Tree Graph CSV

The tree graph CSV is specifically formatted for creating hierarchical visualizations.

### Format

```csv
name,parent,value
project-name,,1000000
project-name/module-name,project-name,500000
project-name/module-name/file.js,project-name/module-name,100000
```

- **name**: Unique identifier for the node
- **parent**: Parent node (empty for root level projects)
- **value**: Size in bytes

### Google Sheets Treemap

1. **Import the CSV:**
   - Open Google Sheets
   - File → Import → Upload → Select `bundle-analysis-tree.csv`

2. **Create Treemap:**
   - Select all data (Ctrl+A)
   - Insert → Chart
   - Chart type → Treemap
   - Configure:
     - Label: `name` column
     - Parent: `parent` column
     - Size: `value` column
     - Color: `value` column (optional)

3. **Customize:**
   - Chart editor → Customize tab
   - Adjust colors, labels, and tooltips

### Google Charts (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  <script type="text/javascript">
    google.charts.load('current', {'packages':['treemap']});
    google.charts.setOnLoadCallback(drawChart);

    async function drawChart() {
      // Load CSV data
      const response = await fetch('bundle-analysis-tree.csv');
      const csvText = await response.text();

      // Parse CSV
      const rows = csvText.split('\n').map(row => {
        const [name, parent, value] = row.split(',');
        return [name, parent || null, parseInt(value) || 0];
      });

      const data = google.visualization.arrayToDataTable([
        ['Name', 'Parent', 'Size'],
        ...rows.slice(1) // Skip header
      ]);

      const tree = new google.visualization.TreeMap(document.getElementById('chart_div'));

      const options = {
        minColor: '#f00',
        midColor: '#ddd',
        maxColor: '#0d0',
        headerHeight: 15,
        fontColor: 'black',
        showScale: true,
        generateTooltip: showFullTooltip
      };

      function showFullTooltip(row, size, value) {
        return '<div style="background:#fd9; padding:10px; border-style:solid">' +
               '<span style="font-family:Courier"><b>' + data.getValue(row, 0) + '</b>, ' +
               value + ' bytes</div>';
      }

      tree.draw(data, options);
    }
  </script>
</head>
<body>
  <div id="chart_div" style="width: 100%; height: 800px;"></div>
</body>
</html>
```

### D3.js Sunburst Chart

```javascript
import * as d3 from 'd3';

// Load CSV
const data = await d3.csv('bundle-analysis-tree.csv', d => ({
  name: d.name,
  parent: d.parent || null,
  value: +d.value
}));

// Convert to hierarchy
const root = d3.stratify()
  .id(d => d.name)
  .parentId(d => d.parent)
  (data);

root.sum(d => d.value);

// Create sunburst
const width = 975;
const height = 975;
const radius = width / 2;

const arc = d3.arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
  .padRadius(radius / 2)
  .innerRadius(d => d.y0)
  .outerRadius(d => d.y1 - 1);

const partition = d3.partition()
  .size([2 * Math.PI, radius]);

partition(root);

const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, root.children.length + 1));

const svg = d3.create('svg')
  .attr('viewBox', [0, 0, width, height]);

svg.append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)
  .selectAll('path')
  .data(root.descendants())
  .join('path')
    .attr('fill', d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr('d', arc)
  .append('title')
    .text(d => `${d.data.name}\n${d3.format(',')(d.value)} bytes`);

document.body.appendChild(svg.node());
```

### Observable Plot

```javascript
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Load and parse data
const data = await d3.csv("bundle-analysis-tree.csv", d => ({
  name: d.name,
  parent: d.parent || undefined,
  value: +d.value
}));

// Create hierarchy
const root = d3.stratify()
  .id(d => d.name)
  .parentId(d => d.parent)
  (data);

root.sum(d => d.value);

// Create treemap
Plot.plot({
  width: 928,
  height: 600,
  margin: 1,
  marks: [
    Plot.tree(root, {
      path: "name",
      value: "value",
      fill: "value",
      title: d => `${d.data.name}\n${d3.format(",")(d.value)} bytes`
    })
  ]
})
```

### Excel Treemap

1. **Import CSV:**
   - Data → From Text/CSV
   - Select `bundle-analysis-tree.csv`
   - Load

2. **Prepare Data:**
   - Ensure columns are: Name, Parent, Value
   - Parent column should have blanks for root items

3. **Create Treemap:**
   - Insert → Hierarchy Chart → Treemap
   - Select data range
   - Configure:
     - Categories: Name
     - Values: Value
     - Series: Parent (optional for colors)

4. **Format:**
   - Right-click chart → Format Chart Area
   - Adjust colors, labels, data labels

## Using the Detailed CSV

The detailed CSV (`bundle-analysis.csv`) is best for:

### Pivot Tables

**Google Sheets / Excel:**

1. Select all data
2. Insert → Pivot Table
3. Configure:
   - Rows: `project`, `moduleName`
   - Values: SUM of `sizeRaw`, SUM of `sizeGzip`
   - Filters: `isNodeModule`, `projectType`

### Charts

**Bar Chart - Top Dependencies by Project:**

1. Filter data by project
2. Sort by `sizeRaw` descending
3. Select top 10 rows
4. Create bar chart with `moduleName` and `sizeRaw`

**Pie Chart - Node Modules vs Project Code:**

1. Create pivot table:
   - Rows: `isNodeModule`
   - Values: SUM of `sizeRaw`
2. Create pie chart from pivot table

### Filtering

**Find all instances of a dependency:**
```
Filter: moduleName = "react"
```

**Find large modules:**
```
Filter: sizeRaw > 10000
Sort by: sizeRaw descending
```

**Compare bundle sizes across projects:**
```
Pivot:
  Rows: project
  Values: SUM of sizeRaw
```

## Tips

1. **Color scales**: Use the `value` column for color intensity in treemaps
2. **Tooltips**: Show full path and formatted size
3. **Interactive**: Enable drill-down to explore nested levels
4. **Filtering**: Pre-filter data to focus on specific projects or large modules
5. **Size formatting**: Convert bytes to KB/MB for better readability in labels

## Example Workflows

### Find optimization opportunities

1. Open tree CSV in Google Sheets
2. Create treemap
3. Look for large red/orange blocks (biggest modules)
4. Note the module names
5. Open detailed CSV
6. Filter by those module names
7. See which chunks/projects use them
8. Decide on optimization strategy (code splitting, tree shaking, etc.)

### Compare projects

1. Create separate treemaps for each project
2. Compare relative sizes of common dependencies
3. Identify projects that might benefit from shared chunks
4. Find duplicate dependencies across projects

### Track changes over time

1. Run analyzer before and after optimization
2. Create treemaps from both runs
3. Compare visually to see size changes
4. Use detailed CSV to identify specific improvements
