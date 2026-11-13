// Infrastructure-only smoke test: exact fit to a fixed public toy dataset.
const points=[1,2,3,4,5];const prediction=points.map(x=>2*x+1);const actual=points.map(x=>2*x+1);
const mse=prediction.reduce((sum,x,i)=>sum+(x-actual[i])**2,0)/points.length;
console.log(JSON.stringify({metrics:{mse},samples:points.length}));
