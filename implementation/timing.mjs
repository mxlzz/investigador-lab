// One policy for CLI, worker, native job and scheduler custody. Increasing only
// the inner timeout would let an outer timer kill the same run prematurely.
export function researchTiming(env=process.env){
 const agentSeconds=Number(env.INVESTIGADOR_AGENT_TIMEOUT_SECONDS??1800);
 if(!Number.isInteger(agentSeconds)||agentSeconds<60||agentSeconds>7200)throw Error('INVESTIGADOR_AGENT_TIMEOUT_SECONDS debe estar entre 60 y 7200');
 const modelAttempts=Number(env.INVESTIGADOR_MODEL_ATTEMPTS??1);
 if(!Number.isInteger(modelAttempts)||modelAttempts<1||modelAttempts>3)throw Error('INVESTIGADOR_MODEL_ATTEMPTS debe estar entre 1 y 3');
 const total=agentSeconds*modelAttempts;
 return {agentSeconds,modelAttempts,workerSeconds:total+60,jobSeconds:total+600,noOutputSeconds:total+570,leaseSeconds:total+900};
}
