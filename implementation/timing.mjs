// One policy for CLI, worker, native job and scheduler custody. Increasing only
// the inner timeout would let an outer timer kill the same run prematurely.
export function researchTiming(env=process.env){
 const agentSeconds=Number(env.INVESTIGADOR_AGENT_TIMEOUT_SECONDS??1800);
 if(!Number.isInteger(agentSeconds)||agentSeconds<60||agentSeconds>7200)throw Error('INVESTIGADOR_AGENT_TIMEOUT_SECONDS debe estar entre 60 y 7200');
 return {agentSeconds,workerSeconds:agentSeconds+60,jobSeconds:agentSeconds+600,noOutputSeconds:agentSeconds+570,leaseSeconds:agentSeconds+900};
}
