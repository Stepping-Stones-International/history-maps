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
      topic: {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        default_view: topic.default_view
      },
      nodes: ordered_nodes(topic).map { |node| node_props(node) },
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
      params.permit(:title, :description, :center_latitude, :center_longitude, :zoom)
    end

    # Roots in date order, each followed by what it embeds, in the order set
    # for them. Sent flat; the sidebar nests it.
    def ordered_nodes(topic)
      by_parent = topic.nodes.group_by(&:parent_id)

      walk = lambda do |parent_id, ordered|
        siblings = by_parent[parent_id] || []
        siblings = parent_id.nil? ? siblings.sort_by(&:chronological_key) : siblings.sort_by(&:position)
        siblings.each { |node| walk.call(node.id, ordered << node) }
        ordered
      end

      walk.call(nil, [])
    end

    # The date is split back into the three fields the form edits, so a node
    # can be loaded straight into the same form it was created with.
    def node_props(node)
      {
        id: node.id,
        title: node.title,
        description: node.description,
        layer: node.layer,
        area: node.area,
        area_json: node.area_json,
        parent_id: node.parent_id,
        position: node.position,
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
