class ChangeBarIdToBeNullableInFriendships < ActiveRecord::Migration[7.1]
  def change
    change_column_null :friendships, :bar_id, true
  end
end