# Objetivo

## Desenvolver uma aplicação de mensagens em tempo real utilizando o protocolo WebSocket, permitindo a comunicação dinâmica entre usuários autenticados em diferentes salas de conversa.

**Requisitos Funcionais**
    - 1. Gestão de Acesso (Controle de Usuários)
        - Cadastro: O sistema deve permitir que novos usuários se registrem no servidor fornecendo as credenciais necessárias. O acesso às funcionalidades de chat é restrito a usuários previamente cadastrados.

        - Autenticação: Para estabelecer uma conexão ativa com o servidor de chat, o usuário deve realizar o login utilizando usuário e senha.

    - 2. Gestão de Salas
        - Criação de Salas: O usuário autenticado deve ter a opção de criar novas salas de chat com nomes identificadores.

        - Navegação: Após o login, o sistema deve listar as salas disponíveis, permitindo que o usuário escolha em qual deseja ingressar.

    - 3. Comunicação e Mensageria
        - Mensagens em Grupo (Broadcast): Por padrão, ao enviar uma mensagem dentro de uma sala, todos os participantes presentes nela devem recebê-la em tempo real.

        - Mensagens Diretas (Seleção de Destinatários): O sistema deve oferecer a funcionalidade de filtrar destinatários.

        - O usuário poderá selecionar um ou mais participantes específicos da lista de membros ativos da sala.

        - Ao enviar a mensagem com essa seleção, apenas os usuários escolhidos e o remetente terão acesso ao conteúdo, respeitando o contexto da sala atual.

**Especificações Técnicas Sugeridas**
*Protocolo: WebSockets (ex: Socket.io, WS, ou bibliotecas nativas).*

**Persistência**: *As informações de usuários e salas devem ser armazenadas (em memória ou banco de dados) para validação durante o processo de login e listagem.*

**Interface**: Deve haver um feedback visual claro sobre quem enviou a mensagem e se ela foi enviada para todos ou para usuários específicos.

**Fluxo de Usuário (User Flow)**
*Registro/Login: Autenticação no servidor.*

**Dashboard**: *Criar uma nova sala ou selecionar uma existente.*

**Sala de Chat**: *Visualizar lista de usuários online na sala.*

**Interação**: *Alternar entre "Enviar para Todos" ou "Selecionar Destinatários".*

**Padronização**: *O sistema de todos devem seguir as mesmas regras para que todos consigam usar o servidor de cada um com o cliente do outro.*