import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import html2canvas from 'html2canvas';

const PieChartDestroyer = () => {
  const [slices, setSlices] = useState(5);
  const [threeD, setThreeD] = useState(false);
  const [explode, setExplode] = useState(false);
  const [colors, setColors] = useState('default');
  const [rotation, setRotation] = useState(0);
  const [hideLabels, setHideLabels] = useState(false);
  const [tinyLabels, setTinyLabels] = useState(false);
  const [randomLabelSizes, setRandomLabelSizes] = useState(false);
  const [shadow, setShadow] = useState(false);
  const [outline, setOutline] = useState(false);
  const [background, setBackground] = useState('none');
  
  // Good options
  const [donut, setDonut] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [textDescription, setTextDescription] = useState(false);
  
  const [chartData, setChartData] = useState([]);
  const [violations, setViolations] = useState([]);
  const [goodChoices, setGoodChoices] = useState([]);
  const [participationCode, setParticipationCode] = useState('');
  const [choiceCount, setChoiceCount] = useState(0);
  const chartRef = useRef(null);

  const MAX_CHOICES = 5;

  // Sample data generator
  const generateData = (numSlices) => {
    const companies = ['Alpha Corp', 'Beta Inc', 'Gamma LLC', 'Delta Ltd', 'Epsilon Co', 
                      'Zeta Group', 'Eta Systems', 'Theta Tech', 'Iota Industries', 'Kappa Corp',
                      'Lambda Ltd', 'Mu Inc', 'Nu Systems', 'Xi Corp', 'Omicron Co',
                      'Pi Tech', 'Rho Industries', 'Sigma Group', 'Tau Ltd', 'Upsilon Inc'];
    
    const data = [];
    for (let i = 0; i < Math.min(numSlices, 20); i++) {
      data.push({
        name: companies[i],
        value: parseFloat((Math.random() * 100 + 20).toFixed(2))
      });
    }
    return data;
  };

  // Generate participation code (7 characters)
  const generateParticipationCode = () => {
    const timestamp = Date.now().toString(36);
    const choices = [slices, threeD, explode, colors, rotation, hideLabels, tinyLabels, randomLabelSizes, shadow, outline, background, donut, largeFont, textDescription].join('');
    let hash = 0;
    for (let i = 0; i < choices.length; i++) {
      hash = ((hash << 5) - hash) + choices.charCodeAt(i);
      hash = hash & hash;
    }
    const hashStr = Math.abs(hash).toString(36).toUpperCase();
    return (timestamp + hashStr).slice(0, 7).toUpperCase();
  };

  // Count active bad choices (first 3 options are free)
  const countChoices = () => {
    let count = 0;
    // Number of Slices, Color Scheme, and Rotation are now FREE
    if (threeD) count++;
    if (explode) count++;
    if (hideLabels || tinyLabels || randomLabelSizes) count++;
    if (shadow) count++;
    if (outline) count++;
    if (background !== 'none') count++;
    return count;
  };

  // Detect violations
  const detectViolations = () => {
    const viols = [];
    
    if (slices > 7) {
      viols.push(`Slice Overload (${slices} slices make comparison nearly impossible)`);
    }
    
    if (threeD) {
      viols.push('The Third Dimension (3D distorts angle perception)');
    }
    
    if (colors === 'random' || colors === 'similar' || colors === 'neon' || colors === 'ugly') {
      viols.push('Color Chaos (poor color choices harm accessibility)');
    }
    
    if (explode) {
      viols.push('Explosive Elements (exploded slices worsen comparison)');
    }
    
    if (hideLabels) {
      viols.push('Information Vandalism (missing labels eliminate context)');
    }
    
    if (tinyLabels && !hideLabels) {
      viols.push('Illegible Labels (tiny text size harms readability)');
    }
    
    if (randomLabelSizes && !hideLabels) {
      viols.push('Inconsistent Typography (random label sizes harm readability)');
    }
    
    if (shadow || background !== 'none') {
      viols.push('Decorative Disaster (unnecessary visual elements add noise without information)');
    }
    
    if (outline) {
      viols.push('Heavy Outlines (thick borders distract from data comparison)');
    }
    
    return viols;
  };

  // Detect good choices
  const detectGoodChoices = () => {
    const goods = [];
    
    if (donut) {
      goods.push('Donut chart (center hole reduces visual clutter)');
    }
    
    if (colors === 'colorsafe') {
      goods.push('Colorblind-safe palette (improves accessibility)');
    }
    
    if (largeFont) {
      goods.push('Larger font size (improves readability)');
    }
    
    if (textDescription) {
      goods.push('Text description provided (makes data accessible)');
    }
    
    return goods;
  };

  // Get colors based on config
  const getColors = (colorScheme, numSlices) => {
    const schemes = {
      default: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'],
      colorblind: ['#004488', '#DDAA33', '#BB5566', '#000000', '#999933', '#882255', '#44AA99', '#117733', '#332288', '#AA4499'],
      colorsafe: ['#0173B2', '#DE8F05', '#029E73', '#CC78BC', '#CA9161', '#949494', '#ECE133', '#56B4E9', '#F0E442', '#D55E00'],
      random: Array(numSlices).fill(0).map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`),
      similar: Array(numSlices).fill(0).map((_, i) => `hsl(200, 70%, ${50 + i}%)`),
      ugly: ['#8B4513', '#FF1493', '#7FFF00', '#FF4500', '#9400D3', '#FFD700', '#FF69B4', '#00CED1', '#DC143C', '#ADFF2F'],
      neon: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00', '#0000FF', '#FF00AA', '#AAFF00', '#00AAFF', '#FF6600']
    };
    
    const baseColors = schemes[colorScheme] || schemes.default;
    while (baseColors.length < numSlices) {
      baseColors.push(...schemes.default);
    }
    return baseColors.slice(0, numSlices);
  };

  // Update chart
  useEffect(() => {
    const data = generateData(slices);
    setChartData(data);
    setViolations(detectViolations());
    setGoodChoices(detectGoodChoices());
    setParticipationCode(generateParticipationCode());
    setChoiceCount(countChoices());
  }, [slices, threeD, explode, colors, rotation, hideLabels, tinyLabels, randomLabelSizes, shadow, outline, background, donut, largeFont, textDescription]);

  // Load from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      setSlices(parseInt(urlParams.get('s')) || 5);
      setThreeD(urlParams.get('3d') === '1');
      setExplode(urlParams.get('e') === '1');
      setColors(urlParams.get('c') || 'default');
      setRotation(parseInt(urlParams.get('r')) || 0);
      setHideLabels(urlParams.get('hl') === '1');
      setTinyLabels(urlParams.get('tl') === '1');
      setRandomLabelSizes(urlParams.get('rls') === '1');
      setShadow(urlParams.get('sh') === '1');
      setOutline(urlParams.get('ol') === '1');
      setBackground(urlParams.get('bg') || 'none');
      setDonut(urlParams.get('d') === '1');
      setLargeFont(urlParams.get('lf') === '1');
      setTextDescription(urlParams.get('td') === '1');
    }
  }, []);

  // Capture chart and copy to clipboard only
  const captureImage = async () => {
    try {
      // Method 1: Try to capture chart as PNG and copy to clipboard
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        // Try to copy to clipboard
        if (navigator.clipboard && window.ClipboardItem) {
          canvas.toBlob(async (blob) => {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              alert('Chart copied to clipboard! You can now paste it anywhere you need.');
            } catch (clipboardError) {
              console.log('Clipboard failed, trying download...', clipboardError);
              downloadImage(canvas);
            }
          });
          return;
        }
      }
    } catch (error) {
      console.log('html2canvas failed, trying download fallback...', error);
    }
    
    // Method 2: If clipboard fails, try to download the image
    try {
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        downloadImage(canvas);
        return;
      }
    } catch (error) {
      console.log('Download fallback failed, showing manual instructions...', error);
    }
    
    // Method 3: Manual screenshot instructions
    showScreenshotInstructions();
  };
  
  const downloadImage = (canvas) => {
    try {
      const link = document.createElement('a');
      link.download = 'pie-chart-destroyer.png';
      link.href = canvas.toDataURL();
      link.click();
      alert('Chart saved to your Downloads folder! You can now use this image file anywhere you need.');
    } catch (error) {
      console.log('Download failed, showing manual instructions...', error);
      showScreenshotInstructions();
    }
  };
  
  const showScreenshotInstructions = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const instructions = isMac 
      ? 'Mac: Press Cmd + Shift + 4, then drag to select your chart'
      : 'Windows: Press Windows + Shift + S, then drag to select your chart';
    
    alert(
      `Automatic capture failed. Please take a manual screenshot:\n\n${instructions}\n\nThen you can paste the image anywhere you need it!`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Pie Chart Destroyer</h1>
          <p className="text-slate-600 mb-4">Create the worst pie chart. You can select up to {MAX_CHOICES} bad options.</p>
          <div className="mb-6 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <p className="text-amber-800 font-semibold">Bad choices selected: {choiceCount} / {MAX_CHOICES}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Chart Options</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Slices <span className="text-green-600 font-semibold">(FREE)</span></label>
                  <select 
                    value={slices}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      setSlices(newValue);
                    }}
                    className="w-full p-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {[3,4,5,6,7,8,9,10,12,15,20].map(n => (
                      <option key={n} value={n}>{n} slices</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Color Scheme <span className="text-green-600 font-semibold">(FREE)</span></label>
                  <select 
                    value={colors}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setColors(newValue);
                    }}
                    className="w-full p-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="default">Default</option>
                    <option value="colorsafe">Colorblind Safe (Good!)</option>
                    <option value="ugly">Ugly Clashing Colors (Bad!)</option>
                    <option value="random">Random</option>
                    <option value="similar">Similar Colors</option>
                    <option value="neon">Neon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rotation (degrees) <span className="text-green-600 font-semibold">(FREE)</span></label>
                  <input 
                    type="number"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      setRotation(newValue);
                    }}
                    className="w-full p-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                    <input 
                      type="checkbox"
                      checked={threeD}
                      onChange={(e) => setThreeD(e.target.checked)}
                      disabled={!threeD && choiceCount >= MAX_CHOICES}
                      className="w-5 h-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Enable 3D (Bad!)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                    <input 
                      type="checkbox"
                      checked={explode}
                      onChange={(e) => setExplode(e.target.checked)}
                      disabled={!explode && choiceCount >= MAX_CHOICES}
                      className="w-5 h-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Explode Slices (Bad!)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                    <input 
                      type="checkbox"
                      checked={shadow}
                      onChange={(e) => setShadow(e.target.checked)}
                      disabled={!shadow && choiceCount >= MAX_CHOICES}
                      className="w-5 h-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Add Drop Shadow (Bad!)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                    <input 
                      type="checkbox"
                      checked={outline}
                      onChange={(e) => setOutline(e.target.checked)}
                      disabled={!outline && choiceCount >= MAX_CHOICES}
                      className="w-5 h-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Thick Outlines (Bad!)</span>
                  </label>

                  <div className="p-3 bg-red-50 rounded-lg">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Background Pattern (Bad!)</label>
                    <select 
                      value={background}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        const wouldAddChoice = background === 'none' && newValue !== 'none';
                        if (wouldAddChoice && choiceCount >= MAX_CHOICES) {
                          alert(`You can only select ${MAX_CHOICES} bad options!`);
                          return;
                        }
                        setBackground(newValue);
                      }}
                      className="w-full p-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="none">None</option>
                      <option value="checkered">Checkered</option>
                      <option value="houndstooth">Houndstooth</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                    <input 
                      type="checkbox"
                      checked={hideLabels}
                      onChange={(e) => setHideLabels(e.target.checked)}
                      disabled={!hideLabels && !tinyLabels && !randomLabelSizes && choiceCount >= MAX_CHOICES}
                      className="w-5 h-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Hide Labels (Bad!)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                    <input 
                      type="checkbox"
                      checked={tinyLabels}
                      onChange={(e) => setTinyLabels(e.target.checked)}
                      disabled={!hideLabels && !tinyLabels && !randomLabelSizes && choiceCount >= MAX_CHOICES}
                      className="w-5 h-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Tiny Labels (Bad!)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                    <input 
                      type="checkbox"
                      checked={randomLabelSizes}
                      onChange={(e) => setRandomLabelSizes(e.target.checked)}
                      disabled={!hideLabels && !tinyLabels && !randomLabelSizes && choiceCount >= MAX_CHOICES}
                      className="w-5 h-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Random Label Sizes (Bad!)</span>
                  </label>

                  <div className="border-t-2 border-slate-200 my-4"></div>

                  <label className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100">
                    <input 
                      type="checkbox"
                      checked={donut}
                      onChange={(e) => setDonut(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-slate-700">Make it a Donut Chart (Good!)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100">
                    <input 
                      type="checkbox"
                      checked={largeFont}
                      onChange={(e) => setLargeFont(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-slate-700">Larger Font (Good!)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100">
                    <input 
                      type="checkbox"
                      checked={textDescription}
                      onChange={(e) => setTextDescription(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-slate-700">Include Text Description (Good!)</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-700 mb-3">Your Chart</h2>
              <div 
                ref={chartRef}
                className="bg-white rounded-lg border-2 border-slate-200 p-4"
                style={{
                  background: 
                    background === 'checkered' ? 
                      'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(135deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(135deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)' :
                    background === 'houndstooth' ?
                      'conic-gradient(#5b7c8d 25%,transparent 0 50%,#edf6ee 0 75%,transparent 0), linear-gradient(135deg, #5b7c8d 0 12.5%,#edf6ee 0 25%, #5b7c8d 0 37.5%,#edf6ee 0 62.5%, #5b7c8d 0 75%,#edf6ee 0 87.5%, #5b7c8d 0)' :
                      'white',
                  backgroundSize: background !== 'none' ? (background === 'checkered' ? '20px 20px' : '100px 100px') : 'auto',
                  backgroundPosition: background === 'checkered' ? '0 0, 10px 10px, 10px 0, 0 10px' : 'auto',
                  filter: shadow ? 'drop-shadow(0 25px 40px rgba(0,0,0,0.7)) drop-shadow(0 10px 20px rgba(0,0,0,0.5))' : 'none'
                }}
              >
                <h3 className="text-center font-bold text-lg mb-2">Market Share</h3>
                <div style={{ position: 'relative' }}>
                  {/* 3D shadow layers - two from different directions */}
                  {threeD && (
                    <>
                      {/* Primary dark shadow from bottom-right */}
                      <div 
                        style={{
                          position: 'absolute',
                          width: '220px',
                          height: '220px',
                          borderRadius: '50%',
                          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, transparent 70%)',
                          left: '54%',
                          top: '62%',
                          transform: 'translateX(-50%) translateY(-20px) scaleY(0.3)',
                          zIndex: 0,
                          filter: 'blur(10px)'
                        }}
                      />
                      {/* Secondary lighter shadow from left */}
                      <div 
                        style={{
                          position: 'absolute',
                          width: '200px',
                          height: '200px',
                          borderRadius: '50%',
                          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, transparent 70%)',
                          left: '42%',
                          top: '58%',
                          transform: 'translateX(-50%) translateY(-20px) scaleY(0.25) rotate(-15deg)',
                          zIndex: 0,
                          filter: 'blur(12px)'
                        }}
                      />
                    </>
                  )}
                  <div
                    style={{
                      transform: threeD ? 'perspective(1000px) rotateX(25deg) rotateY(-15deg)' : 'none',
                      transformStyle: 'preserve-3d',
                      width: '100%',
                      height: '350px',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          startAngle={90 - rotation}
                          endAngle={450 - rotation}
                          outerRadius={110}
                          innerRadius={donut ? 40 : 0}
                          fill="#8884d8"
                          dataKey="value"
                          label={!hideLabels ? (randomLabelSizes ? (props) => {
                            // Determine size range based on additive options
                            let sizeOptions;
                            if (tinyLabels && largeFont) {
                              // Both: chaotic wide range
                              sizeOptions = [4, 6, 8, 10, 14, 18, 22, 24];
                            } else if (tinyLabels) {
                              // Tiny random sizes
                              sizeOptions = [4, 5, 6, 7, 8, 9, 10];
                            } else if (largeFont) {
                              // Large random sizes
                              sizeOptions = [14, 16, 18, 20, 22, 24];
                            } else {
                              // Medium random sizes
                              sizeOptions = [8, 10, 12, 14, 16, 18];
                            }
                            const size = sizeOptions[props.index % sizeOptions.length];
                            return (
                              <text 
                                x={props.x} 
                                y={props.y} 
                                fill="black" 
                                textAnchor={props.textAnchor}
                                dominantBaseline="central"
                                fontSize={size}
                              >
                                {props.name}
                              </text>
                            );
                          } : {
                            fontSize: (() => {
                              if (tinyLabels && largeFont) return 12; // midpoint
                              if (tinyLabels) return 8;
                              if (largeFont) return 16;
                              return 12;
                            })()
                          }) : false}
                          labelLine={!hideLabels}
                          paddingAngle={explode ? 8 : 0}
                        >
                          {chartData.map((entry, index) => {
                            const chartColors = getColors(colors, slices);
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={chartColors[index % chartColors.length]}
                                stroke={outline ? '#000' : (shadow ? '#000' : '#fff')}
                                strokeWidth={outline ? 6 : (shadow ? 3 : 1)}
                              />
                            );
                          })}
                        </Pie>
                        {!hideLabels && <Legend />}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {textDescription && (
                  <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-slate-700">
                    <strong>Description:</strong> This chart shows the market share distribution across {slices} companies. 
                    The data represents each company's percentage of total market value.
                  </div>
                )}
              </div>

              {violations.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Rules Violated:</h3>
                  <ul className="space-y-1 text-sm text-red-700">
                    {violations.map((v, i) => (
                      <li key={i}>• {v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {goodChoices.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Good Practices Applied:</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    {goodChoices.map((g, i) => (
                      <li key={i}>• {g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {violations.length === 0 && goodChoices.length === 0 && (
                <div className="mt-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600 italic">No rules violated - this chart is disappointingly functional.</p>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <button
                  onClick={captureImage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                          📸 Copy Chart to Clipboard
                        </button>

                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Participation Code:</h3>
                  <code className="text-lg font-mono text-purple-700 bg-white px-3 py-2 rounded block text-center">
                    {participationCode}
                  </code>
                  <p className="text-xs text-purple-600 mt-2">Copy this code to submit as proof of participation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartDestroyer;
