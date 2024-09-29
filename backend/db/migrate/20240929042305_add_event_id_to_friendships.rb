class AddEventIdToFriendships < ActiveRecord::Migration[7.1]
  def change
    add_column :friendships, :event_id, :integer
  end
end
