import { Router } from 'express';
import { healthRouter } from './health';
import { chatRouter } from './chat';
import { sosRouter } from './sos';
import { nearbyRouter } from './nearby';
import { voiceRouter } from './voice';

export const router = Router();

router.use('/health', healthRouter);
router.use('/chat', chatRouter);
router.use('/sos', sosRouter);
router.use('/nearby', nearbyRouter);
router.use('/voice', voiceRouter);
