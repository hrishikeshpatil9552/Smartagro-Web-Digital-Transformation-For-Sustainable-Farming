import express from 'express';
import { 
  addConsultant, 
  getConsultants, 
  updateConsultant, 
  deleteConsultant 
} from '../controllers/consultantController';

const router = express.Router();

router.post('/add', addConsultant);      // Create
router.get('/', getConsultants);         // Read (Search)
router.put('/:id', updateConsultant);    // Update
router.delete('/:id', deleteConsultant); // Delete

export default router;