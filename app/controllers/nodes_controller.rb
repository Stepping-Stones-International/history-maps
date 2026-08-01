class NodesController < ApplicationController
  def create
    topic = Current.user.topics.find(params[:topic_id])
    node = topic.nodes.new(node_params)

    if node.save
      redirect_to edit_topic_path(topic), notice: "Node added."
    else
      redirect_to edit_topic_path(topic), inertia: { errors: node.errors }
    end
  end

  private
    # Inertia forms post a flat payload.
    def node_params
      params.permit(:date_type, :title, :description, :latitude, :longitude)
    end
end
