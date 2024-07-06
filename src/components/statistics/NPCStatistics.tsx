import { useEffect } from 'react';

import useFetch from '../../hooks/useFetch';
import { ApiLogAction, type ApiFetchNPCStatsResponse } from '../../lib/api.types';

const NPCStatistics = () => {
  const { data, error, loading, sendRequest } = useFetch<ApiFetchNPCStatsResponse>();

  useEffect(() => {
    sendRequest({ uri: 'stats/npcs', options: { method: 'GET' } });
  }, []);

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold'>NPCs</h2>
      <div className='flex w-full flex-col gap-5'>
        <div className='stats shadow'>
          <div className='stat'>
            <div className='stat-title'>Messages sent with LLM NPC</div>
            <div className='stat-value'>
              {loading && <span className='loading loading-spinner' />}
              {!loading &&
                !error &&
                !!data &&
                data.interactions.find((interaction) => interaction.type === ApiLogAction.NPC_AI_SENT_MESSAGE)
                  ?.interactions}
            </div>
            <div className='stat-desc'>
              {!loading &&
                !error &&
                !!data &&
                data.interactions.find((interaction) => interaction.type === ApiLogAction.NPC_AI_SENT_MESSAGE)
                  ?.users}{' '}
              users
            </div>
          </div>
          <div className='stat'>
            <div className='stat-title'>Messages sent with Normal NPC</div>
            <div className='stat-value'>
              {loading && <span className='loading loading-spinner' />}
              {!loading &&
                !error &&
                !!data &&
                data.interactions.find((interaction) => interaction.type === ApiLogAction.NPC_NORMAL_SELECTED_OPTION)
                  ?.interactions}
            </div>
            <div className='stat-desc'>
              {!loading &&
                !error &&
                !!data &&
                data.interactions.find((interaction) => interaction.type === ApiLogAction.NPC_NORMAL_SELECTED_OPTION)
                  ?.users}{' '}
              users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPCStatistics;
