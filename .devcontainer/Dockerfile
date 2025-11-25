# Devcontainer workspace image based on Node 24
FROM node:24-bullseye

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000
ENV DEBIAN_FRONTEND=noninteractive

# Install common dev tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    sudo git curl ca-certificates lsb-release gnupg2 openssh-client procps build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for the container (matches common devcontainer setup)
# Guard against existing UID/GID or username to avoid build-time conflicts.
RUN set -eux; \
    # if the group name does not exist, try to create it (but avoid failing if GID taken)
    if ! getent group "${USERNAME}" >/dev/null 2>&1; then \
    if getent group ${USER_GID} >/dev/null 2>&1; then \
    # GID exists for another group; create group with a unique GID
    NEW_GID=$(awk -F: '/^${USERNAME}:/ {print $3; exit}' /etc/group || true); true; \
    groupadd "${USERNAME}" || true; \
    else \
    groupadd --gid ${USER_GID} ${USERNAME}; \
    fi; \
    fi; \
    # create user only if it does not exist
    if ! id -u "${USERNAME}" >/dev/null 2>&1; then \
    # If requested UID is already used, omit --uid to let system pick one
    if id -u ${USER_UID} >/dev/null 2>&1; then \
    useradd -s /bin/bash -m -g "${USERNAME}" "${USERNAME}"; \
    else \
    useradd -s /bin/bash --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME}; \
    fi; \
    fi; \
    echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${USERNAME}; \
    chmod 0440 /etc/sudoers.d/${USERNAME}

WORKDIR /workspace

# Use a long-running command by default; VS Code will start its server when attaching.
CMD ["sleep", "infinity"]
