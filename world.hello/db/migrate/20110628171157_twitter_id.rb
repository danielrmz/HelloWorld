class TwitterId < ActiveRecord::Migration
  def self.up
    add_column :users, :twitter_id, :integer
    add_index :users, :twitter_id, :unique => true
    change_column :users, :email, :string, :null => nil
  end

  def self.down
    remove_column :users, :twitter_id
    change_column :users, :email, :string, :null => false
  end
end
