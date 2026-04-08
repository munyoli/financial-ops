import pool from '../config/db';

export async function getNextSequence(entityType: string): Promise<string> {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows]: any = await connection.query(
            'SELECT prefix, current_value, padding FROM sequences WHERE entity_type = ? FOR UPDATE',
            [entityType]
        );

        if (rows.length === 0) {
            throw new Error(`Sequence not found for entity type: ${entityType}`);
        }

        const { prefix, current_value, padding } = rows[0];
        const nextValue = current_value + 1;

        await connection.query(
            'UPDATE sequences SET current_value = ?, updated_at = CURRENT_TIMESTAMP WHERE entity_type = ?',
            [nextValue, entityType]
        );

        await connection.commit();

        const paddedNumber = nextValue.toString().padStart(padding, '0');
        return `${prefix}${paddedNumber}`;
    } catch (error) {
        await connection.rollback();
        console.error(`Failed to generate sequence for ${entityType}:`, error);
        throw error;
    } finally {
        connection.release();
    }
}
