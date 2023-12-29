// internals
import { supabase } from '../app'

export async function pruneTables() {
  try {
    // Fetch table names
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public') // assuming you want to prune tables in the public schema

    console.log('\n ~ pruneTables ~ tables:', tables)

    return
    if (error)
      throw error

    // Loop through each table and prune
    for (const table of tables) {
      // Define your pruning logic here
      // Example: DELETE FROM table WHERE created_at < now() - interval '30 days'
      const pruneQuery = `DELETE FROM ${table.tablename} WHERE ...` // replace with your conditions

      const { error: pruneError } = await supabase.raw(pruneQuery)
      if (pruneError)
        throw pruneError

      console.log(`Pruned table: ${table.tablename}`)
    }
  }
  catch (err) {
    console.error('Error pruning tables:', err)
  }
}
