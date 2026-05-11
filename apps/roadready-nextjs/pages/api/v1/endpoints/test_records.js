import { query } from '../../../lib/db';
import Joi from 'joi';

// Validation schema – copy fields that were in the corresponding Pydantic model.
const test_recordsRequest = Joi.object({
  /* TODO: add fields */
});

export default async function handler(req, res) {
  const method = req.method;
  const url    = req.url;          // /<endpoint> or /<endpoint>/<id>

  /* ---------- POST /test_records ---------- */
  if (method === 'POST' && url.endsWith('/test_records')) {
    try {
      const { error, value } = test_recordsRequest.validate(req.body);
      if (error) throw new Error(error.message);

      // ---- DB logic --------------------------------------------------------
      const result = await query('SELECT * FROM table WHERE id=$1', [value.id]);

      return res.json(result.rows[0]);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ detail: e.message });
    }
  }

  /* ---------- GET /test_records/:id ---------- */
  if (method === 'GET' && url.startsWith('/test_records/')) {
    const id = url.split('/').pop();
    try {
      const result = await query('SELECT * FROM table WHERE id=$1', [id]);
      if (!result.rows[0]) return res.status(404).json({ detail: 'Not found' });
      return res.json(result.rows[0]);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ detail: e.message });
    }
  }

  /* ---------- PUT /test_records/:id ---------- */
  if (method === 'PUT' && url.startsWith('/test_records/')) {
    const id = url.split('/').pop();
    try {
      const { error, value } = test_recordsRequest.validate(req.body);
      if (error) throw new Error(error.message);

      await query(
        'UPDATE table SET field=$1 WHERE id=$2',
        [value.field, id]
      );
      return res.json({ message: 'Updated' });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ detail: e.message });
    }
  }

  /* ---------- DELETE /test_records/:id ---------- */
  if (method === 'DELETE' && url.startsWith('/test_records/')) {
    const id = url.split('/').pop();
    try {
      await query('DELETE FROM table WHERE id=$1', [id]);
      return res.json({ message: 'Deleted' });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ detail: e.message });
    }
  }

  // Default – method not allowed
  res.setHeader('Allow', 'GET,POST,PUT,DELETE');
  return res.status(405).end('Method ' + method + ' Not Allowed');
}
