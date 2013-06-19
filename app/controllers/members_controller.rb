class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])
    authorize! :show, workspace

    present paginate WorkspaceAccess.members_for(current_user, workspace)
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :owner, workspace

    workspace_current_members = workspace.members.map(&:id)
    workspace.update_attributes!(:member_ids => params[:member_ids], :has_added_member => true)
    workspace.solr_reindex_later

    create_events(workspace, workspace_current_members, params[:member_ids])
    destroy_import_schedules(workspace, workspace_current_members, params[:member_ids])
    present workspace.reload.members
  end

  private

  def create_events(workspace, workspace_current_members, member_ids)
    added_members = member_ids - workspace_current_members.map(&:to_s)
    unless added_members.empty?
      member = User.find(added_members.first)
      num_added = added_members.count
      member_added_event = Events::MembersAdded.by(current_user).add(:workspace => workspace, :member => member, :num_added => num_added)
    end
    added_members.each do |member_id|
      Notification.create!(:recipient_id => member_id.to_i, :event_id => member_added_event.id)
    end
  end

  def destroy_import_schedules(workspace, workspace_current_members, member_ids)
    deleted_members = workspace_current_members.map(&:to_s) - member_ids
    deleted_members.each do |user_id|
      ImportSchedule.where(:workspace_id => workspace.id, :user_id => user_id).destroy_all
    end
  end
end