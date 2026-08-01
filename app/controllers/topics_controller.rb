class TopicsController < ApplicationController
  allow_unauthenticated_access only: :index

  def index
    render inertia: "Topics/Index", props: {
      topics: Topic.includes(:author).order(:title).map { |topic|
        {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          author_email: topic.author.email_address
        }
      }
    }
  end

  # The map view for a topic. Scoped to the signed-in user's own topics.
  def edit
    topic = Current.user.topics.find(params[:id])

    render inertia: "Topics/Edit", props: {
      topic: { id: topic.id, title: topic.title, description: topic.description },
      nodes: topic.nodes.sort_by(&:chronological_key).map { |node| node_props(node) },
      # Sent from the model so the form cannot drift from the validation.
      dateTypes: Node::DATE_TYPES.map { |value, label| { value: value, label: label } },
      eras: Node::ERAS
    }
  end

  def create
    topic = Current.user.topics.new(topic_params)

    if topic.save
      redirect_to edit_topic_path(topic), notice: "Topic added."
    else
      # Back to the list, where the modal stays open and shows the errors.
      redirect_to topics_path,
        alert: "That topic could not be saved.", inertia: { errors: topic.errors }
    end
  end

  def update
    topic = Current.user.topics.find(params[:id])

    if topic.update(topic_params)
      redirect_to edit_topic_path(topic), notice: "Topic updated."
    else
      redirect_to edit_topic_path(topic),
        alert: "That topic could not be saved.", inertia: { errors: topic.errors }
    end
  end

  private
    # Inertia forms post a flat payload.
    def topic_params
      params.permit(:title, :description)
    end

    # The date is split back into the three fields the form edits, so a node
    # can be loaded straight into the same form it was created with.
    def node_props(node)
      {
        id: node.id,
        title: node.title,
        description: node.description,
        date_type: node.date_type,
        occurred_month: node.occurred_month.to_s,
        occurred_day: node.occurred_day.to_s,
        occurred_year: node.occurred_year.to_s,
        date_display: node.date_display,
        era: node.era,
        latitude: node.latitude,
        longitude: node.longitude
      }
    end
end
