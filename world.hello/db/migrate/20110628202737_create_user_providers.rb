class CreateUserProviders < ActiveRecord::Migration
  def self.up
    create_table :user_providers do |t|
      t.string :provider, :null => false, :primary => true
      t.integer :user_id, :null => false, :primary => true
      t.string :token,  :null => false
      t.string :secret, :null => false
      
      t.timestamps
    end
    
    add_column :users, :is_new, :boolean
    
  end

  def self.down
    drop_table :user_providers
    remove_column :users, :is_new
  end
end

