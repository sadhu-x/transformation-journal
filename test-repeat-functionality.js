// Test script for repeat functionality
// Run this after applying the database migration

const { supabase } = require('./lib/supabase.js')

async function testRepeatFunctionality() {
  console.log('Testing repeat functionality...')
  
  try {
    // Test 1: Check if repeat_type column exists
    console.log('\n1. Checking if repeat_type column exists...')
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'non_negotiables')
      .eq('column_name', 'repeat_type')
    
    if (columnError) {
      console.error('Error checking columns:', columnError)
      return
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ repeat_type column exists')
    } else {
      console.log('❌ repeat_type column does not exist - run the migration first')
      return
    }
    
    // Test 2: Insert a test non-negotiable with repeat_type
    console.log('\n2. Testing insertion with repeat_type...')
    const testItem = {
      text: 'Test daily repeat item',
      completed: false,
      date: new Date().toISOString().split('T')[0],
      repeat_type: 'daily'
    }
    
    const { data: insertedItem, error: insertError } = await supabase
      .from('non_negotiables')
      .insert([testItem])
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting test item:', insertError)
      return
    }
    
    console.log('✅ Successfully inserted item with repeat_type:', insertedItem.repeat_type)
    
    // Test 3: Query items by repeat_type
    console.log('\n3. Testing query by repeat_type...')
    const { data: dailyItems, error: queryError } = await supabase
      .from('non_negotiables')
      .select('*')
      .eq('repeat_type', 'daily')
    
    if (queryError) {
      console.error('Error querying daily items:', queryError)
      return
    }
    
    console.log(`✅ Found ${dailyItems.length} daily repeating items`)
    
    // Test 4: Clean up test data
    console.log('\n4. Cleaning up test data...')
    if (insertedItem) {
      const { error: deleteError } = await supabase
        .from('non_negotiables')
        .delete()
        .eq('id', insertedItem.id)
      
      if (deleteError) {
        console.error('Error deleting test item:', deleteError)
      } else {
        console.log('✅ Test data cleaned up')
      }
    }
    
    console.log('\n🎉 All tests passed! Repeat functionality is working correctly.')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testRepeatFunctionality() 