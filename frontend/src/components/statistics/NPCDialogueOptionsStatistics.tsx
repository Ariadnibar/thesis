import { useEffect } from 'react';

import useFetch from '../../hooks/useFetch';
import { type ApiFetchNPCDialogueOptionsStatsResponse } from '../../lib/api.types';

const NPCDialogueOptionsStatistics = () => {
  const { data, error, loading, sendRequest } = useFetch<ApiFetchNPCDialogueOptionsStatsResponse>();

  useEffect(() => {
    sendRequest({ uri: 'stats/npcs/dialogue-options', options: { method: 'GET' } });
  }, []);

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold'>NPC Dialogue Options</h2>
      <div className='flex w-full flex-col gap-5'>
        <div className='stats stats-vertical shadow'>
          {data?.map(({ npc, dialogueOptions }) => (
            <div key={npc} className='stat'>
              <div className='stat-title mb-4'>{npc}</div>

              <div className='stat-desc flex h-full flex-col'>
                {dialogueOptions.map(({ content, clicks }) => (
                  <span key={content}>
                    <b>{content}</b> - <b>{clicks}</b> clicks
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NPCDialogueOptionsStatistics;
