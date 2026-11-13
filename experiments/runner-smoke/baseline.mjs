// Infrastructure-only smoke test: a deliberately imperfect approximation.
const points=[1,2,3,4,5];const prediction=points.map(x=>2*x+1.5);const actual=points.map(x=>2*x+1);
const mse=prediction.reduce((sum,x,i)=>sum+(x-actual[i])**2,0)/points.length;
console.log(JSON.stringify({metrics:{mse},samples:points.length}));
