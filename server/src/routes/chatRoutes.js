import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { authenticateFarmer } from '../middleware/auth.js';

const router = Router();

router.use(authenticateFarmer);

router.get('/conversations', chatController.listConversations);
router.post('/conversations', chatController.createConversation);
router.get('/conversations/:id', chatController.getConversationMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;
