import type { Emitter } from 'mitt';
import mitt from 'mitt';

type Events = {
  resize: {
    detail: {
      width: number;
      height: number;
    };
  };

  logoChange: boolean;
};

/** 通用事件调度器 */
export const emitter: Emitter<Events> = mitt<Events>();
