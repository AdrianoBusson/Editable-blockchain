import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { allExpanded, darkStyles, defaultStyles, JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import {
  Blocks,
  Award,
  ChevronDown,
  Database,
  Eye,
  EyeOff,
  FileText,
  Menu,
  Moon,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  WalletCards,
  X
} from "lucide-react";
import "./styles.css";

const MENU_ITEMS = [
  { id: "presentation", labelKey: "menu.presentation", icon: FileText },
  { id: "blocks", labelKey: "menu.blocks", icon: Blocks },
  { id: "transactions", labelKey: "menu.transactions", icon: WalletCards },
  { id: "users", labelKey: "menu.users", icon: Users },
  { id: "dataVerification", labelKey: "menu.dataVerification", icon: ShieldCheck },
  { id: "settings", labelKey: "menu.settings", icon: Settings }
];

const EMPTY_SETTINGS = {
  sqliteFile: "server/front.sqlite",
  apiHost: "192.168.1.109",
  apiPort: 3000,
  blocksRoute: "/user/blockslimit",
  blocksLimit: 100,
  chBits: 128,
  lastBlockRoute: "/user/lastblockID",
  blockByIdRoute: "/user/blockbyID",
  internalRoutes: ["/user/lastblockID", "/user/blockbyID", "/user/blockslimit"],
  theme: "dark",
  language: "en",
  presentationHtmlEn: "<h1><center>Blockchain</center></h1><p><center>Access frontend</center></p>",
  presentationHtmlPt: "<h1><center>Blockchain</center></h1><p><center>Frontend de acesso</center></p>",
  presentationHtml: "<h1><center>Blockchain</center></h1><p><center>Access frontend</center></p>"
};

const RIGHT_TO_BE_FORGOTTEN_INFODATA = {
  deleted: true,
  reason: "Right to be Forgotten / Exercício do direito ao esquecimento"
};

const CERTIFICATE_TEXT_FIELDS = [
  { id: "userIdNumber", labelKey: "certificate.userIdNumber", value: "00000000" },
  { id: "rightCertificate", labelKey: "certificate.rightCertificate", value: "A6F91C2D8E4B7A0F3C5D9E1A6B8C0D2E4F6A8B1C3D5E7F9A0B2C4D6E8F1A3B5" },
  { id: "issuedOn", labelKey: "certificate.issuedOn", value: new Date().toISOString() },
  { id: "blockNumber", labelKey: "certificate.blockNumber", value: "0000" }
];

const DEFAULT_CERTIFICATE_TEXT_LAYOUT = {
  color: "#152c45",
  fontFamily: "Arial",
  fontSize: 24,
  horizontal: 0,
  horizontalStep: 1,
  vertical: 0,
  verticalStep: 1
};

function createDefaultCertificateLayout() {
  return CERTIFICATE_TEXT_FIELDS.reduce((layout, field) => ({
    ...layout,
    [field.id]: { ...DEFAULT_CERTIFICATE_TEXT_LAYOUT }
  }), {});
}

function normalizeCertificateLayout(layout) {
  const source = layout && typeof layout === "object" ? layout : {};
  return CERTIFICATE_TEXT_FIELDS.reduce((nextLayout, field) => ({
    ...nextLayout,
    [field.id]: { ...DEFAULT_CERTIFICATE_TEXT_LAYOUT, ...(source[field.id] || {}) }
  }), {});
}

const TRANSLATIONS = {
  en: {
    "brand.subtitle": "Editable data",
    "menu.presentation": "Presentation",
    "menu.blocks": "Blocks",
    "menu.transactions": "Transactions",
    "menu.users": "Users",
    "menu.dataVerification": "Data verification",
    "menu.settings": "Settings",
    "theme.light": "Light theme",
    "theme.dark": "Dark theme",
    "presentation.eyebrow": "Presentation",
    "presentation.title": "LGPD blockchain access system",
    "blocks.eyebrow": "Blocks",
    "blocks.title": "Received blocks list",
    "blocks.reload": "Reload",
    "blocks.loading": "Loading",
    "blocks.loadingList": "Loading blocks...",
    "blocks.empty": "No blocks have been loaded yet.",
    "blocks.loaded": "Blocks loaded successfully.",
    "blocks.updated": "Blocks updated successfully!",
    "blocks.accessError": "Access error",
    "blocks.updating": "Updating",
    "blocks.monitoring": "Monitoring latest block",
    "blocks.count": "{count} block(s) in memory",
    "blocks.filteredEmpty": "No blocks match these filters.",
    "blocks.filterBlockNumber": "Block number",
    "blocks.filterBlockNumberPlaceholder": "93",
    "blocks.filterUserDataAddress": "User data address",
    "blocks.filterUserDataAddressPlaceholder": "0x...",
    "blocks.filterFrom": "From",
    "blocks.filterTo": "To",
    "blocks.header": "Block #{number}",
    "blocks.headerWithDate": "Block #{number} - {dateTime}",
    "blocks.noNumber": "no number",
    "blocks.invalidLastBlock": "The latest block API responded, but did not return a valid block_number.",
    "blocks.syncProgress": "Updating blocks: loading block {number} of {last}.",
    "blocks.syncLimited": "Updating latest {limit} block(s).",
    "blockDetails.loading": "Loading block details...",
    "blockDetails.loadError": "Could not load block details.",
    "blockDetails.metadata": "Metadata",
    "blockDetails.userData": "User Data",
    "blockDetails.json": "JSON",
    "blockDetails.edit": "Edit",
    "blockDetails.save": "Save",
    "blockDetails.rightToBeForgotten": "Right to be Forgotten",
    "blockDetails.issueCertificate": "Issue a certificate",
    "editModal.title": "Editing User Data",
    "editModal.infodata": "Infodata",
    "editModal.chTrapDoor": "CH Trap Door",
    "editModal.chTrapDoorPlaceholder": "Enter your Chameleon Hash Trap Door here",
    "editModal.blockchainPrivateKey": "Blockchain Private Key",
    "editModal.signInfodata": "Sign Infodata",
    "editModal.signTransaction": "Sign Transaction",
    "editModal.sendToBlockchain": "Send to Blockchain",
    "editModal.validSign": "Valid Sign",
    "editModal.invalidSign": "Invalid Sign",
    "editModal.signed": "Signed!",
    "editModal.signError": "Sign Error",
    "editModal.blockCreated": "Block Created!",
    "editModal.blockCreateError": "Error creating block",
    "forgottenModal.title": "Confirmation",
    "forgottenModal.userdataId": "userdata_id",
    "forgottenModal.cancel": "Cancel",
    "forgottenModal.confirm": "Confirm",
    "transactions.eyebrow": "Transactions",
    "transactions.title": "Sent requests and received responses",
    "transactions.route": "Route",
    "transactions.routePlaceholder": "/user",
    "transactions.from": "From",
    "transactions.to": "To",
    "transactions.order": "Order",
    "transactions.newest": "Newest first",
    "transactions.oldest": "Oldest first",
    "transactions.empty": "No access records match these filters.",
    "users.eyebrow": "Users",
    "users.title": "Blockchain users",
    "users.loading": "Loading users...",
    "users.empty": "No users found.",
    "users.select": "Select a user to edit.",
    "users.createUser": "Manual create user",
    "users.automaticCreateUser": "Automatic creat user",
    "users.save": "Save user",
    "users.saving": "Saving",
    "users.saved": "User saved successfully.",
    "users.delete": "Delete user",
    "users.deleted": "User deleted successfully.",
    "users.deleteConfirm": "Delete this user from the database?",
    "users.deleteError": "Could not delete user: {message}",
    "users.sendToBlockchain": "Send to blockchain",
    "users.sendNotSentToBlockchain": "Send not sent to blockchain",
    "users.checkOnBlockchain": "Check user on blockchain",
    "users.create": "Create",
    "users.getFromBlockchain": "Get from blockchain",
    "users.generating": "Generating",
    "users.index": "index",
    "users.name": "name",
    "users.userId": "user_id",
    "users.address": "address",
    "users.tel": "tel",
    "users.email": "email",
    "users.chHash": "ch_hash",
    "users.chHashPublicKey": "ch_hash.publicKey",
    "users.chHashPrivateKey": "ch_hash.privateKey",
    "users.sentToBlockchain": "Sent to blockchain",
    "users.totalUsers": "Total users:",
    "users.sentUsers": "Sent users:",
    "users.notSentUsers": "Not Sent users:",
    "users.filter": "Filter:",
    "users.sent": "Sent",
    "users.notSent": "Not Sent",
    "users.loadError": "Could not load users.",
    "users.saveError": "Could not save user: {message}",
    "users.generateError": "Could not create field: {message}",
    "autoUserModal.title": "Automatic creat user",
    "autoUserModal.usersQuantity": "Users quantity",
    "autoUserModal.created": "Created",
    "autoUserModal.createUsers": "Create users",
    "autoUserModal.creating": "Creating",
    "autoUserModal.error": "Could not create users: {message}",
    "bulkSendModal.title": "Send not sent to blockchain",
    "bulkSendModal.quantity": "Quantity",
    "bulkSendModal.interval": "Interval",
    "bulkSendModal.send": "Send",
    "bulkSendModal.cancel": "Cancel",
    "bulkSendModal.sent": "Sent",
    "bulkSendModal.waiting": "Waiting",
    "bulkSendModal.usersSent": "Users Sent",
    "bulkSendModal.sendCanceled": "Send Canceled",
    "bulkSendModal.sendError": "Send Error",
    "sendUserModal.title": "Send to blockchain",
    "sendUserModal.infodata": "Infodata",
    "sendUserModal.privateKey": "privateKey",
    "sendUserModal.signInfodata": "Sign infodata",
    "sendUserModal.sendToBlockchain": "Send to blockchain",
    "sendUserModal.validSign": "Valid Sign",
    "sendUserModal.invalidSign": "Invalid Sign",
    "sendUserModal.blockCreated": "Block Created!",
    "sendUserModal.createdFail": "Created Fail!",
    "sendUserModal.userAlreadyOnBlockchain": "User already on blockchain",
    "userCheckModal.title": "User check",
    "userCheckModal.loading": "Checking user on blockchain...",
    "userCheckModal.exists": "User did not request for the right to be forgotten yet or never been on blockchain",
    "userCheckModal.notExists": "User already request for the right to be forgotten and was deleted or never been on blockchain",
    "userCheckModal.error": "Could not check user on blockchain.",
    "userCheckModal.ok": "OK",
    "dataVerification.eyebrow": "Data verification",
    "dataVerification.cardHeader": "Block Verifier",
    "dataVerification.cardTitle": "Verify block by number",
    "dataVerification.cardText": "Enter the block number to verify",
    "dataVerification.blockNumber": "Block Number",
    "dataVerification.verify": "Verify block",
    "dataVerification.verifying": "Verifying block",
    "dataVerification.valid": "The hash of block {blockNumber} matches the calculated hash and the previous block hash. Valid block.",
    "dataVerification.invalid": "The Merk hash of block {blockNumber} does not match the calculated hash and/or the previous block hash. Invalid block.",
    "dataVerification.error": "Could not verify the block: {message}",
    "dataVerification.rightCardHeader": "Verify right to be forgotten",
    "dataVerification.rightCardTitle": "Check if the user requested the right to be forgotten and their data was deleted.",
    "dataVerification.rightCardText": "Enter the user ID number to verify",
    "dataVerification.userIdNumber": "User ID Number",
    "dataVerification.onlyNumbers": "Only numbers",
    "dataVerification.certificate": "Right to be forgotten certificate",
    "dataVerification.certificatePlaceholder": "Only Hex. The certificate number 'cuckoofilter_hash' generated in the block when the record was deleted.",
    "dataVerification.verifyInBlockchain": "Verify in blockchain",
    "dataVerification.verifyingInBlockchain": "Verifying in blockchain",
    "dataVerification.blockNumberResult": "Block Number: {blockNumber}",
    "dataVerification.timeStampResult": "time_stamp: {timeStamp}",
    "dataVerification.rightError": "Could not verify the right to be forgotten: {message}",
    "dataVerification.rightInvalidResponse": "The blockchain returned an invalid verification response.",
    "status.success": "Success",
    "status.failure": "Failure",
    "settings.eyebrow": "Settings",
    "settings.title": "Connection and presentation parameters",
    "settings.sqliteConnected": "SQLite connected",
    "settings.sqliteUnavailable": "SQLite unavailable",
    "settings.localDatabase": "Local database",
    "settings.blockchainApis": "Blockchain APIs",
    "settings.apiHost": "API access IP",
    "settings.apiPort": "API access port",
    "settings.blocksRoute": "Blocks return route",
    "settings.blocksLimit": "Block quantity",
    "settings.chBits": "ch_bits",
    "settings.lastBlockRoute": "Latest block verification route",
    "settings.blockByIdRoute": "Route to return a block by block_number",
    "settings.internalRoutes": "Internal routes that will not be saved in history",
    "settings.interface": "Interface",
    "settings.theme": "Theme",
    "settings.dark": "Dark",
    "settings.light": "Light",
    "settings.languages": "Languages",
    "settings.english": "English",
    "settings.portuguese": "Português",
    "settings.presentationHtmlEn": "Presentation page HTML (English)",
    "settings.presentationHtmlPt": "Presentation page HTML (Portuguese)",
    "certificate.title": "Certificate",
    "certificate.textToEdit": "Text to edit",
    "certificate.userIdNumber": "User ID Number",
    "certificate.rightCertificate": "Right to be forgotten certificate",
    "certificate.issuedOn": "Issued on",
    "certificate.blockNumber": "Block #",
    "certificate.textColor": "Text color",
    "certificate.fontFamily": "Text font",
    "certificate.fontSize": "Font size",
    "certificate.horizontal": "Horizontal",
    "certificate.horizontalStep": "Horizontal step",
    "certificate.vertical": "Vertical",
    "certificate.verticalStep": "Vertical step",
    "certificate.background": "Certificate background (.jpg)",
    "certificate.invalidFile": "Please select a valid .jpg image.",
    "certificate.noImage": "Upload a .jpg certificate background to enable text adjustment.",
    "certificate.loadError": "Could not load the certificate configuration: {message}",
    "certificate.saveError": "Could not save the certificate configuration: {message}",
    "certificateModal.title": "Right to be forgotten certificate",
    "certificateModal.confirmUserId": "Confirm the User Id for issue a certificate",
    "certificateModal.confirm": "Confirm",
    "certificateModal.confirming": "Confirming",
    "certificateModal.userIdNotMatch": "User ID not Match",
    "certificateModal.generating": "Generating certificate PDF...",
    "certificateModal.missingBackground": "The certificate background has not been configured in Settings.",
    "certificateModal.error": "Could not generate the certificate PDF: {message}",
    "certificateModal.save": "Save",
    "certificateModal.close": "Close",
    "settings.save": "Save settings",
    "settings.saving": "Saving",
    "settings.saveSuccess": "Settings saved successfully.",
    "settings.saveFailure": "Failed to save settings: {message}",
    "errors.serverAccess": "Failed to access the server.",
    "errors.apiStatus": "API {route} returned status {status}"
  },
  "pt-BR": {
    "brand.subtitle": "Dados editaveis",
    "menu.presentation": "Apresentacao",
    "menu.blocks": "Blocos",
    "menu.transactions": "Transacoes",
    "menu.users": "Usuarios",
    "menu.dataVerification": "Checagem de dados",
    "menu.settings": "Configuracoes",
    "theme.light": "Tema claro",
    "theme.dark": "Tema escuro",
    "presentation.eyebrow": "Apresentacao",
    "presentation.title": "Sistema de acesso a blockchain LGPD",
    "blocks.eyebrow": "Blocos",
    "blocks.title": "Lista de blocos recebidos",
    "blocks.reload": "Recarregar",
    "blocks.loading": "Carregando",
    "blocks.loadingList": "Carregando blocos...",
    "blocks.empty": "Nenhum bloco foi carregado ainda.",
    "blocks.loaded": "Blocos carregados com sucesso.",
    "blocks.updated": "Blocos atualizados com sucesso!",
    "blocks.accessError": "Erro de acesso",
    "blocks.updating": "Atualizando",
    "blocks.monitoring": "Monitorando ultimo bloco",
    "blocks.count": "{count} bloco(s) em memoria",
    "blocks.filteredEmpty": "Nenhum bloco corresponde a estes filtros.",
    "blocks.filterBlockNumber": "Numero do bloco",
    "blocks.filterBlockNumberPlaceholder": "93",
    "blocks.filterUserDataAddress": "Endereco de dados do usuario",
    "blocks.filterUserDataAddressPlaceholder": "0x...",
    "blocks.filterFrom": "De",
    "blocks.filterTo": "Ate",
    "blocks.header": "Bloco #{number}",
    "blocks.headerWithDate": "Bloco #{number} - {dateTime}",
    "blocks.noNumber": "sem numero",
    "blocks.invalidLastBlock": "A API de ultimo bloco respondeu, mas nao retornou um block_number valido.",
    "blocks.syncProgress": "Atualizando blocos: carregando bloco {number} de {last}.",
    "blocks.syncLimited": "Atualizando os ultimos {limit} bloco(s).",
    "blockDetails.loading": "Carregando detalhes do bloco...",
    "blockDetails.loadError": "Nao foi possivel carregar os detalhes do bloco.",
    "blockDetails.metadata": "Metadados",
    "blockDetails.userData": "Dados de usuario",
    "blockDetails.json": "JSON",
    "blockDetails.edit": "Editar",
    "blockDetails.save": "Salvar",
    "blockDetails.rightToBeForgotten": "Direito ao esquecimento",
    "blockDetails.issueCertificate": "Emitir certificado",
    "editModal.title": "Editando Dados do Usuario",
    "editModal.infodata": "Infodata",
    "editModal.chTrapDoor": "CH Trap Door",
    "editModal.chTrapDoorPlaceholder": "Entre com sua Chave Secreta do Camaleao Hash aqui",
    "editModal.blockchainPrivateKey": "Chave Secreta da Blockchain",
    "editModal.signInfodata": "Assinar Infodata",
    "editModal.signTransaction": "Assinar Transacao",
    "editModal.sendToBlockchain": "Enviar para Blockchain",
    "editModal.validSign": "Assinatura Valida",
    "editModal.invalidSign": "Assinatura Invalida",
    "editModal.signed": "Assinado!",
    "editModal.signError": "Assinatura com erro",
    "editModal.blockCreated": "Bloco Criado!",
    "editModal.blockCreateError": "Erro ao criar o bloco",
    "forgottenModal.title": "Confirmacao",
    "forgottenModal.userdataId": "userdata_id",
    "forgottenModal.cancel": "Cancelar",
    "forgottenModal.confirm": "Confirmar",
    "transactions.eyebrow": "Transacoes",
    "transactions.title": "Acessos enviados e respostas recebidas",
    "transactions.route": "Rota",
    "transactions.routePlaceholder": "/user",
    "transactions.from": "De",
    "transactions.to": "Ate",
    "transactions.order": "Ordem",
    "transactions.newest": "Mais recentes",
    "transactions.oldest": "Mais antigas",
    "transactions.empty": "Nenhum acesso registrado com estes filtros.",
    "users.eyebrow": "Usuarios",
    "users.title": "Usuarios da blockchain",
    "users.loading": "Carregando usuarios...",
    "users.empty": "Nenhum usuario encontrado.",
    "users.select": "Selecione um usuario para editar.",
    "users.createUser": "Criacao manual de usuario",
    "users.automaticCreateUser": "Criacao automatica de usuario",
    "users.save": "Salvar usuario",
    "users.saving": "Salvando",
    "users.saved": "Usuario salvo com sucesso.",
    "users.delete": "Apagar usuario",
    "users.deleted": "Usuario apagado com sucesso.",
    "users.deleteConfirm": "Apagar este usuario do banco de dados?",
    "users.deleteError": "Nao foi possivel apagar usuario: {message}",
    "users.sendToBlockchain": "Enviar para blockchain",
    "users.sendNotSentToBlockchain": "Enviar as nao enviadas para blockchain",
    "users.checkOnBlockchain": "Checar usuario na blockchain",
    "users.create": "Criar",
    "users.getFromBlockchain": "Obter da blockchain",
    "users.generating": "Gerando",
    "users.index": "index",
    "users.name": "name",
    "users.userId": "user_id",
    "users.address": "address",
    "users.tel": "tel",
    "users.email": "email",
    "users.chHash": "ch_hash",
    "users.chHashPublicKey": "ch_hash.publicKey",
    "users.chHashPrivateKey": "ch_hash.privateKey",
    "users.sentToBlockchain": "Enviado para blockchain",
    "users.totalUsers": "Usuarios total:",
    "users.sentUsers": "Usuarios enviados:",
    "users.notSentUsers": "Usuarios nao enviados:",
    "users.filter": "Filtro:",
    "users.sent": "Enviados",
    "users.notSent": "Nao Enviados",
    "users.loadError": "Nao foi possivel carregar usuarios.",
    "users.saveError": "Nao foi possivel salvar usuario: {message}",
    "users.generateError": "Nao foi possivel criar o campo: {message}",
    "autoUserModal.title": "Criacao automatica de usuario",
    "autoUserModal.usersQuantity": "Quantidade de usuarios",
    "autoUserModal.created": "Criados",
    "autoUserModal.createUsers": "Criar usuarios",
    "autoUserModal.creating": "Criando",
    "autoUserModal.error": "Nao foi possivel criar usuarios: {message}",
    "bulkSendModal.title": "Enviar as nao enviadas para blockchain",
    "bulkSendModal.quantity": "Quantidade",
    "bulkSendModal.interval": "Intervalo",
    "bulkSendModal.send": "Enviar",
    "bulkSendModal.cancel": "Cancelar",
    "bulkSendModal.sent": "Enviados",
    "bulkSendModal.waiting": "Aguardando",
    "bulkSendModal.usersSent": "Usuarios enviados",
    "bulkSendModal.sendCanceled": "Envio Cancelado",
    "bulkSendModal.sendError": "Erro de envio",
    "sendUserModal.title": "Enviar para blockchain",
    "sendUserModal.infodata": "Infodata",
    "sendUserModal.privateKey": "privateKey",
    "sendUserModal.signInfodata": "Assinar infodata",
    "sendUserModal.sendToBlockchain": "Enviar para blockchain",
    "sendUserModal.validSign": "Assinatura Valida",
    "sendUserModal.invalidSign": "Assinatura invalida",
    "sendUserModal.blockCreated": "Bloco Criado!",
    "sendUserModal.createdFail": "Falha na criacao",
    "sendUserModal.userAlreadyOnBlockchain": "Usuario ja existe na blockchain",
    "userCheckModal.title": "Checagem de usuario",
    "userCheckModal.loading": "Checando usuario na blockchain...",
    "userCheckModal.exists": "Usuario ainda nao pediu para exercer o direito ao esquecimento ou nunca esteve na blockchain",
    "userCheckModal.notExists": "Usuario ja pediu para exercer o direito ao esquecimento e foi apagado ou nunca esteve na blockchain",
    "userCheckModal.error": "Nao foi possivel checar o usuario na blockchain.",
    "userCheckModal.ok": "OK",
    "dataVerification.eyebrow": "Checagem de dados",
    "dataVerification.cardHeader": "Verificador de Bloco",
    "dataVerification.cardTitle": "Verificar bloco pelo numero",
    "dataVerification.cardText": "Entre com o numero do bloco para verificacao",
    "dataVerification.blockNumber": "Numero do bloco",
    "dataVerification.verify": "Verificar bloco",
    "dataVerification.verifying": "Verificando bloco",
    "dataVerification.valid": "O Merk hash do bloco {blockNumber} corresponde ao hash calculado e ao hash do bloco anterior. Bloco valido.",
    "dataVerification.invalid": "O Merk hash do bloco {blockNumber} nao corresponde ao hash calculado e/ou ao hash do bloco anterior. Bloco invalido.",
    "dataVerification.error": "Nao foi possivel verificar o bloco: {message}",
    "dataVerification.rightCardHeader": "Verificador de direito ao esquecimento",
    "dataVerification.rightCardTitle": "Verificar se o usuario solicitou direito ao esquecimento e seus dados foram apagados.",
    "dataVerification.rightCardText": "Entre com o numero do usuario para verificacao",
    "dataVerification.userIdNumber": "Numero do ID do Usuario",
    "dataVerification.onlyNumbers": "Apenas numeros",
    "dataVerification.certificate": "Certificado de direito ao esquecimento",
    "dataVerification.certificatePlaceholder": "Apenas Hex. O numero do certificado 'cuckoofilter_hash' gerado no bloco quando o registro foi apagado.",
    "dataVerification.verifyInBlockchain": "Verificar na blockchain",
    "dataVerification.verifyingInBlockchain": "Verificando na blockchain",
    "dataVerification.blockNumberResult": "Numero do Bloco: {blockNumber}",
    "dataVerification.timeStampResult": "time_stamp: {timeStamp}",
    "dataVerification.rightError": "Nao foi possivel verificar o direito ao esquecimento: {message}",
    "dataVerification.rightInvalidResponse": "A blockchain retornou uma resposta de verificacao invalida.",
    "status.success": "Sucesso",
    "status.failure": "Falha",
    "settings.eyebrow": "Configuracoes",
    "settings.title": "Parametros de conexao e apresentacao",
    "settings.sqliteConnected": "SQLite conectado",
    "settings.sqliteUnavailable": "SQLite indisponivel",
    "settings.localDatabase": "Banco local",
    "settings.blockchainApis": "APIs da blockchain",
    "settings.apiHost": "IP de acesso as APIs",
    "settings.apiPort": "Porta de acesso as APIs",
    "settings.blocksRoute": "Rota de retorno dos blocos",
    "settings.blocksLimit": "Quantidade de blocos",
    "settings.chBits": "ch_bits",
    "settings.lastBlockRoute": "Rota de verificacao do ultimo bloco",
    "settings.blockByIdRoute": "Rota para retornar bloco por block_number",
    "settings.internalRoutes": "Rotas internas que nao serao gravadas no historico",
    "settings.interface": "Interface",
    "settings.theme": "Tema",
    "settings.dark": "Escuro",
    "settings.light": "Claro",
    "settings.languages": "Idiomas",
    "settings.english": "English",
    "settings.portuguese": "Português",
    "settings.presentationHtmlEn": "HTML da pagina Apresentacao (ingles)",
    "settings.presentationHtmlPt": "HTML da pagina Apresentacao (portugues)",
    "certificate.title": "Certificado",
    "certificate.textToEdit": "Texto para editar",
    "certificate.userIdNumber": "Numero de ID de Usuario",
    "certificate.rightCertificate": "Certificado de direito ao esquecimento",
    "certificate.issuedOn": "Emitido em",
    "certificate.blockNumber": "Numero do bloco",
    "certificate.textColor": "Cor do texto",
    "certificate.fontFamily": "Fonte do texto",
    "certificate.fontSize": "Tamanho da fonte",
    "certificate.horizontal": "Horizontal",
    "certificate.horizontalStep": "Passo horizontal",
    "certificate.vertical": "Vertical",
    "certificate.verticalStep": "Passo vertical",
    "certificate.background": "Fundo do certificado (.jpg)",
    "certificate.invalidFile": "Selecione uma imagem .jpg valida.",
    "certificate.noImage": "Envie um fundo de certificado .jpg para habilitar o ajuste de texto.",
    "certificate.loadError": "Nao foi possivel carregar a configuracao do certificado: {message}",
    "certificate.saveError": "Nao foi possivel salvar a configuracao do certificado: {message}",
    "certificateModal.title": "Certificado de direito ao esquecimento",
    "certificateModal.confirmUserId": "Confirme a Identificacao do usuario para emitir o certificado",
    "certificateModal.confirm": "Confirmar",
    "certificateModal.confirming": "Confirmando",
    "certificateModal.userIdNotMatch": "Identificacao de usuario nao corresponde",
    "certificateModal.generating": "Gerando PDF do certificado...",
    "certificateModal.missingBackground": "O fundo do certificado nao foi configurado em Configuracoes.",
    "certificateModal.error": "Nao foi possivel gerar o PDF do certificado: {message}",
    "certificateModal.save": "Salvar",
    "certificateModal.close": "Fechar",
    "settings.save": "Salvar configuracoes",
    "settings.saving": "Salvando",
    "settings.saveSuccess": "Configuracoes salvas com sucesso.",
    "settings.saveFailure": "Falha ao salvar configuracoes: {message}",
    "errors.serverAccess": "Falha ao acessar o servidor.",
    "errors.apiStatus": "API {route} retornou status {status}"
  }
};

function makeTranslator(language) {
  const dictionary = TRANSLATIONS[language] || TRANSLATIONS.en;
  return (key, values = {}) => {
    const template = dictionary[key] || TRANSLATIONS.en[key] || key;
    return Object.entries(values).reduce(
      (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
      template
    );
  };
}

// Wraps fetch responses and keeps error handling consistent across views.
async function requestJson(url, options = {}, t = makeTranslator("en")) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) {
    const rawMessage = typeof data?.data?.raw === "string"
      ? data.data.raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : "";
    const routeMessage = data?.route ? t("errors.apiStatus", { route: data.route, status: data.status || response.status }) : "";
    const message = data?.message || data?.data?.error || [routeMessage, rawMessage].filter(Boolean).join(": ") || t("errors.serverAccess");
    const error = new Error(message);
    error.payload = data;
    throw error;
  }
  return data;
}

function jsonText(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

function parseEditableJson(value) {
  if (typeof value !== "string") return value || {};
  return value.trim() ? JSON.parse(value) : {};
}

function splitChHash(value) {
  try {
    const chHash = parseEditableJson(value);
    return {
      publicKey: jsonText(chHash.publicKey || {}),
      privateKey: String(chHash.privateKey || "")
    };
  } catch {
    return { publicKey: "", privateKey: "" };
  }
}

function userToDraft(user) {
  if (!user) return null;
  const chHash = splitChHash(user.ch_hash);
  return {
    index: user.index,
    name: user.name || "",
    user_id: String(user.user_id || ""),
    address: jsonText(user.address),
    tel: jsonText(user.tel),
    email: jsonText(user.email),
    ch_hash: jsonText(user.ch_hash),
    ch_hash_publicKey: chHash.publicKey,
    ch_hash_privateKey: chHash.privateKey,
    sent: Boolean(user.sent)
  };
}

function emptyUserDraft() {
  return {
    index: "",
    name: "",
    user_id: "",
    address: "",
    tel: "",
    email: "",
    ch_hash: "",
    ch_hash_publicKey: "",
    ch_hash_privateKey: "",
    sent: false
  };
}

function draftToUserPayload(draft) {
  return {
    name: draft.name,
    user_id: draft.user_id,
    address: parseEditableJson(draft.address),
    tel: parseEditableJson(draft.tel),
    email: parseEditableJson(draft.email),
    ch_hash: {
      publicKey: parseEditableJson(draft.ch_hash_publicKey),
      privateKey: String(draft.ch_hash_privateKey || "")
    },
    sent: Boolean(draft.sent)
  };
}

function buildUserBlockchainInfodata(draft) {
  return {
    Index: draft.index,
    name: draft.name,
    User_id: draft.user_id,
    address: parseEditableJson(draft.address),
    tel: parseEditableJson(draft.tel),
    email: parseEditableJson(draft.email),
    ch_hash: {
      publicKey: getDraftPublicKey(draft)
    }
  };
}

function getDraftPrivateKey(draft) {
  if (draft?.ch_hash_privateKey !== undefined) return String(draft.ch_hash_privateKey || "");
  return String(parseEditableJson(draft?.ch_hash || "{}")?.privateKey || "");
}

function getDraftPublicKey(draft) {
  if (draft?.ch_hash_publicKey !== undefined) return parseEditableJson(draft.ch_hash_publicKey);
  return parseEditableJson(draft?.ch_hash || "{}")?.publicKey || {};
}

function buildUserChamhashPayload(draft) {
  return {
    publicKey: getDraftPublicKey(draft),
    infodata: buildUserBlockchainInfodata(draft)
  };
}

function buildAddNewDataUserPayload(draft, signReturn) {
  const infodata = buildUserBlockchainInfodata(draft);
  return {
    tx: {
      userdata_id: draft.user_id,
      infodata: {
        User_id: draft.user_id,
        message: infodata
      },
      ch_hash: {
        publicKey: getDraftPublicKey(draft),
        hash: signReturn?.hash,
        xp: signReturn?.xp
      }
    }
  };
}

async function sendDraftUserToBlockchain(draft, t, currentSignReturn = null) {
  let signResult = currentSignReturn;
  if (!signResult) {
    const signResponse = await requestJson("/api/blockchain/chamhash", {
      method: "POST",
      body: JSON.stringify(buildUserChamhashPayload(draft))
    }, t);
    signResult = signResponse?.data || signResponse;
  }
  if (signResult?.ok !== true || !signResult?.xp) {
    throw new Error(t("sendUserModal.invalidSign"));
  }

  const sendResponse = await requestJson("/api/blockchain/addnewdatauser", {
    method: "POST",
    body: JSON.stringify(buildAddNewDataUserPayload(draft, signResult))
  }, t);
  const sendResult = sendResponse?.data || sendResponse;
  if (sendResult?.exist === true || sendResult?.exists === true) {
    throw new Error(t("sendUserModal.userAlreadyOnBlockchain"));
  }
  if (sendResult?.sucesso !== true) {
    throw new Error(t("sendUserModal.createdFail"));
  }

  const sentResponse = await requestJson(`/api/users/${draft.index}/sent`, { method: "PATCH" }, t);
  return { signResult, sendResult, user: sentResponse.user };
}

// Extracts block_number from API payloads that may arrive in slightly different shapes.
function getBlockNumber(block) {
  if (block == null) return null;
  if (Array.isArray(block)) return getBlockNumber(block[0]);
  if (typeof block === "number") return block;
  if (typeof block.block_number === "number") return block.block_number;
  if (typeof block.block_number === "string") return Number(block.block_number);
  if (typeof block.lastBlockID === "number") return block.lastBlockID;
  if (typeof block.last_block_id === "number") return block.last_block_id;
  if (typeof block.data === "number") return block.data;
  if (block.data && block.data !== block) return getBlockNumber(block.data);
  return null;
}

// Extracts and formats the timestamp displayed beside each block number.
function getBlockDateTime(block, language) {
  if (block == null) return "";
  if (Array.isArray(block)) return getBlockDateTime(block[0], language);

  const timestamp = getBlockTimestamp(block);
  if (!timestamp && block.data && block.data !== block) return getBlockDateTime(block.data, language);
  if (!timestamp) return "";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return String(timestamp);

  return date.toLocaleString(language === "pt-BR" ? "pt-BR" : "en-US");
}

function getBlockHeader(block, language, t) {
  const number = getBlockNumber(block) ?? t("blocks.noNumber");
  const dateTime = getBlockDateTime(block, language);
  return dateTime ? t("blocks.headerWithDate", { number, dateTime }) : t("blocks.header", { number });
}

function getBlockTimestamp(block) {
  if (block == null) return "";
  if (Array.isArray(block)) return getBlockTimestamp(block[0]);
  return block.time_stamp || block.timestamp || block.created_at || block.date_time || (block.data && block.data !== block ? getBlockTimestamp(block.data) : "");
}

function getBlockUserDataAddress(block) {
  return String(firstAvailableValue(block, [
    "userdata_address",
    "userdata.address",
    "user_data.userdata_address",
    "user_data.address",
    "data.userdata_address",
    "data.userdata.address",
    "data.user_data.userdata_address",
    "data.user_data.address"
  ]) || "");
}

function blockMatchesFilters(block, filters) {
  const numberFilter = String(filters.blockNumber || "").trim();
  const addressFilter = String(filters.userdataAddress || "").trim().toLowerCase();
  const from = filters.from ? new Date(filters.from) : null;
  const to = filters.to ? new Date(filters.to) : null;
  const blockDate = getBlockTimestamp(block) ? new Date(getBlockTimestamp(block)) : null;

  if (numberFilter && !String(getBlockNumber(block) ?? "").includes(numberFilter)) return false;
  if (addressFilter && !getBlockUserDataAddress(block).toLowerCase().includes(addressFilter)) return false;
  if (from && blockDate && blockDate < from) return false;
  if (to && blockDate && blockDate > to) return false;
  if ((from || to) && !blockDate) return false;
  return true;
}

function firstAvailableValue(source, paths) {
  for (const path of paths) {
    const value = path.split(".").reduce((current, key) => {
      if (current == null) return undefined;
      return current[key];
    }, source);
    if (value !== undefined && value !== null) return value;
  }
  return "";
}

function fieldValue(source, paths) {
  const value = firstAvailableValue(source, paths);
  if (value === "") return "";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function parseJsonField(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getChPublicKey(source) {
  return firstAvailableValue(source, ["ch_hash.publicKey", "ch_hash.publickey", "publicKey", "publickey"]) || {};
}

function getChHashValue(source) {
  return firstAvailableValue(source, ["ch_hash.hash", "hash", "data.ch_hash.hash", "data.hash"]);
}

function getChXp(source) {
  return firstAvailableValue(source, ["ch_hash.xp", "xp", "data.ch_hash.xp", "data.xp"]) || {};
}

function getChXpFromResponse(source) {
  return firstAvailableValue(source, [
    "data.ch_hash.xp",
    "ch_hash.xp",
    "data.xp",
    "xp",
    "data.data.ch_hash.xp",
    "data.data.xp"
  ]) || {};
}

function getInfodataUserId(source) {
  const infodata = firstAvailableValue(source, ["infodata", "userdata.infodata"]);
  const parsedInfodata = parseJsonField(infodata);
  return firstAvailableValue(parsedInfodata, ["User_id", "user_id", "userdata_id"]);
}

function buildChCollisionPayload(details, infodataText, trapDoor) {
  const publicKey = getChPublicKey(details);
  return {
    publicKey: {
      g: publicKey.g,
      p: publicKey.p,
      q: publicKey.q,
      y: publicKey.y
    },
    privateKey: trapDoor,
    hash: getChHashValue(details),
    newInfodata: parseJsonField(infodataText)
  };
}

function buildForgottenChCollisionPayload(details, trapDoor) {
  const publicKey = getChPublicKey(details);
  return {
    publicKey: {
      g: publicKey.g,
      p: publicKey.p,
      q: publicKey.q,
      y: publicKey.y
    },
    privateKey: trapDoor,
    hash: getChHashValue(details),
    newInfodata: JSON.stringify({
      deleted: true,
      reason: "Right to be Forgotten / Exercício do direito ao esquecimento"
    })
  };
}

function buildUpdateUserDataPayload(details, infodataText, chResponse) {
  const publicKey = getChPublicKey(details);
  const xp = getChXpFromResponse(chResponse);
  return {
    mode: 1,
    tx: {
      infodata: parseJsonField(infodataText),
      ch_hash: {
        publicKey: {
          g: publicKey.g,
          p: publicKey.p,
          q: publicKey.q,
          y: publicKey.y
        },
        hash: getChHashValue(details),
        xp: {
          r: xp.r,
          s: xp.s
        }
      }
    }
  };
}

function buildForgottenUpdatePayload(details, chResponse) {
  const publicKey = getChPublicKey(details);
  const xp = getChXpFromResponse(chResponse);
  return {
    mode: 0,
    tx: {
      infodata: JSON.stringify({
        deleted: true,
        reason: "Right to be Forgotten / Exercício do direito ao esquecimento"
      }),
      ch_hash: {
        publicKey: {
          g: publicKey.g,
          p: publicKey.p,
          q: publicKey.q,
          y: publicKey.y
        },
        hash: getChHashValue(details),
        xp: {
          r: xp.r,
          s: xp.s
        }
      }
    }
  };
}

const METADATA_FIELDS = [
  ["block_number", ["block_number"]],
  ["time_stamp", ["time_stamp", "timestamp"]],
  ["parent_hash", ["parent_hash"]],
  ["origin_id", ["origin_id", "origin.id", "origin_node_id"]],
  ["origin_level", ["origin_level", "origin.level"]],
  ["origin_address", ["origin_address", "origin.address"]],
  ["origin_pb_key", ["origin_pb_key", "origin.pb_key", "origin.public_key"]],
  ["sealer_id", ["sealer_id", "sealer.id", "sealer_node_id"]],
  ["sealer_level", ["sealer_level", "sealer.level"]],
  ["sealer_address", ["sealer_address", "sealer.address"]],
  ["sealer_pb_key", ["sealer_pb_key", "sealer.pb_key", "sealer.public_key"]],
  ["merk_hash", ["merk_hash"]],
  ["cuckoofilter_hash", ["cuckoofilter_hash"]],
  ["userdata_id_hash", ["userdata_id_hash"]]
];

const USER_DATA_FIELDS = [
  ["userdata_id", ["userdata_id", "userdata.id"]],
  ["userdata_address", ["userdata_address", "userdata.address"]],
  ["userdata_pb_key", ["userdata_pb_key", "userdata.pb_key", "userdata.public_key"]],
  ["infodata", ["infodata", "userdata.infodata"], "textarea"],
  ["ch_hash: publickey", ["ch_hash.publicKey", "ch_hash.publickey", "publicKey", "publickey"], "textarea"],
  ["ch_hash:xp", ["ch_hash.xp", "xp", "data.ch_hash.xp", "data.xp"], "textarea"]
];

// Normalizes list responses to an array before the accordion renders.
function extractBlocks(payload) {
  const source = payload?.data ?? payload;
  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.blocks)) return source.blocks;
  if (Array.isArray(source?.data)) return source.data;
  if (source && typeof source === "object") return [source];
  return [];
}

// Sorts blocks from newest to oldest based on block_number.
function sortBlocksDescending(blocks) {
  return [...blocks].sort((a, b) => (getBlockNumber(b) || 0) - (getBlockNumber(a) || 0));
}

function currentPresentationHtml(settings) {
  return settings.language === "pt-BR" ? settings.presentationHtmlPt : settings.presentationHtmlEn;
}

function JsonViewer({ value }) {
  return <pre className="json-viewer">{JSON.stringify(value, null, 2)}</pre>;
}

function StatusPill({ ok, children }) {
  return <span className={`status-pill ${ok ? "ok" : "warn"}`}>{children}</span>;
}

function AccordionList({ items, renderHeader, renderBody, emptyMessage }) {
  const [openId, setOpenId] = useState(null);

  if (!items.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="accordion-list">
      {items.map((item, index) => {
        const id = item.id ?? item.block_number ?? index;
        const isOpen = openId === id;
        return (
          <section className={`accordion-item ${isOpen ? "open" : ""}`} key={id}>
            <button className="accordion-header" onClick={() => setOpenId(isOpen ? null : id)}>
              <span>{renderHeader(item)}</span>
              <ChevronDown size={18} />
            </button>
            {isOpen && <div className="accordion-body">{renderBody(item)}</div>}
          </section>
        );
      })}
    </div>
  );
}

function DetailField({ label, value, multiline = false, readOnly = true, onChange }) {
  return (
    <label className="detail-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} rows={5} />
      ) : (
        <input value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} />
      )}
    </label>
  );
}

function EditUserDataModal({ details, initialInfoData, onClose, onBlockReload, t }) {
  const [infodata, setInfodata] = useState(initialInfoData);
  const [trapDoor, setTrapDoor] = useState("");
  const [chResponse, setChResponse] = useState(null);
  const [createResponse, setCreateResponse] = useState(null);
  const [chStatus, setChStatus] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [chLocked, setChLocked] = useState(false);
  const [busyStep, setBusyStep] = useState("");

  const chIsValid = chStatus === "valid";
  const canSendToBlockchain = chIsValid && !busyStep;

  async function signInfodata() {
    setChLocked(true);
    setBusyStep("ch");
    setChStatus("");
    setCreateStatus("");
    setChResponse(null);
    setCreateResponse(null);

    try {
      const payload = buildChCollisionPayload(details, infodata, trapDoor);
      const response = await requestJson("/api/blockchain/chcollision", {
        method: "POST",
        body: JSON.stringify(payload)
      }, t);
      setChResponse(response);
      const result = response?.data || response;
      const valid = result?.ok === true && result?.valid === true;
      setChStatus(valid ? "valid" : "invalid");
    } catch {
      setChStatus("invalid");
    } finally {
      setBusyStep("");
    }
  }

  async function sendToBlockchain() {
    setBusyStep("create");
    setCreateStatus("");
    setCreateResponse(null);
    try {
      const payload = buildUpdateUserDataPayload(details, infodata, chResponse);
      const response = await requestJson("/api/blockchain/updateuserdata", {
        method: "POST",
        body: JSON.stringify(payload)
      }, t);
      setCreateResponse(response);
      const result = response?.data || response;
      const created = response?.status === 201 && result?.sucesso === true;
      setCreateStatus(created ? "created" : "error");
      if (created) {
        await onBlockReload?.();
      }
    } catch {
      setCreateStatus("error");
    } finally {
      setBusyStep("");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="edit-modal">
        <header className="modal-header">
          <h2>{t("editModal.title")}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </header>

        <div className="modal-body">
          <label>
            <span>{t("editModal.infodata")}</span>
            <textarea
              autoFocus
              value={infodata}
              readOnly={chLocked}
              onChange={(event) => setInfodata(event.target.value)}
              rows={7}
            />
          </label>

          <label>
            <span>{t("editModal.chTrapDoor")}</span>
            <input
              value={trapDoor}
              readOnly={chLocked}
              placeholder={t("editModal.chTrapDoorPlaceholder")}
              onChange={(event) => setTrapDoor(event.target.value)}
            />
          </label>

          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={signInfodata} disabled={busyStep === "ch"}>
              {t("editModal.signInfodata")}
            </button>
            {chStatus && (
              <span className={`action-status ${chStatus === "valid" ? "ok" : "error"}`}>
                {chStatus === "valid" ? t("editModal.validSign") : t("editModal.invalidSign")}
              </span>
            )}
          </div>

          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={sendToBlockchain} disabled={!canSendToBlockchain}>
              {t("editModal.sendToBlockchain")}
            </button>
            {createStatus && (
              <span className={`action-status ${createStatus === "created" ? "ok" : "error"}`}>
                {createStatus === "created" ? t("editModal.blockCreated") : t("editModal.blockCreateError")}
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function RightToBeForgottenModal({ details, onClose, onBlockReload, t }) {
  const userdataId = fieldValue(details, ["userdata_id", "userdata.id"]);
  const [trapDoor, setTrapDoor] = useState("");
  const [chResponse, setChResponse] = useState(null);
  const [deleteResponse, setDeleteResponse] = useState(null);
  const [chStatus, setChStatus] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");
  const [chLocked, setChLocked] = useState(false);
  const [busyStep, setBusyStep] = useState("");

  const chIsValid = chStatus === "valid";
  const canSendToBlockchain = chIsValid && !busyStep;

  async function confirmSignature() {
    setChLocked(true);
    setBusyStep("ch");
    setChStatus("");
    setDeleteStatus("");
    setChResponse(null);
    setDeleteResponse(null);

    try {
      const payload = buildForgottenChCollisionPayload(details, trapDoor);
      const response = await requestJson("/api/blockchain/chcollision", {
        method: "POST",
        body: JSON.stringify(payload)
      }, t);
      setChResponse(response);
      const result = response?.data || response;
      const valid = result?.ok === true && result?.valid === true;
      setChStatus(valid ? "valid" : "invalid");
    } catch {
      setChStatus("invalid");
    } finally {
      setBusyStep("");
    }
  }

  async function sendToBlockchain() {
    setBusyStep("delete");
    setDeleteStatus("");
    setDeleteResponse(null);
    try {
      const payload = buildForgottenUpdatePayload(details, chResponse);
      const response = await requestJson("/api/blockchain/updateuserdata", {
        method: "POST",
        body: JSON.stringify(payload)
      }, t);
      setDeleteResponse(response);
      const result = response?.data || response;
      const created = response?.status === 201 && result?.sucesso === true;
      setDeleteStatus(created ? "created" : "error");
      if (created) {
        await onBlockReload?.();
      }
    } catch {
      setDeleteStatus("error");
    } finally {
      setBusyStep("");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="edit-modal">
        <header className="modal-header">
          <h2>{t("forgottenModal.title")}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </header>

        <div className="modal-body">
          <label>
            <span>{t("forgottenModal.userdataId")}</span>
            <input value={userdataId} readOnly />
          </label>

          <label>
            <span>{t("editModal.chTrapDoor")}</span>
            <input
              autoFocus
              value={trapDoor}
              readOnly={chLocked}
              placeholder={t("editModal.chTrapDoorPlaceholder")}
              onChange={(event) => setTrapDoor(event.target.value)}
            />
          </label>

          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={onClose}>
              {t("forgottenModal.cancel")}
            </button>
            <button className="secondary-action small-action" type="button" onClick={confirmSignature} disabled={busyStep === "ch"}>
              {t("forgottenModal.confirm")}
            </button>
            {chStatus && (
              <span className={`action-status ${chStatus === "valid" ? "ok" : "error"}`}>
                {chStatus === "valid" ? t("editModal.validSign") : t("editModal.invalidSign")}
              </span>
            )}
          </div>

          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={sendToBlockchain} disabled={!canSendToBlockchain}>
              {t("editModal.sendToBlockchain")}
            </button>
            {deleteStatus && (
              <span className={`action-status ${deleteStatus === "created" ? "ok" : "error"}`}>
                {deleteStatus === "created" ? t("editModal.blockCreated") : t("editModal.blockCreateError")}
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SendUserToBlockchainModal({ draft, onClose, onSent, t }) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [signReturn, setSignReturn] = useState(null);
  const [signStatus, setSignStatus] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [busyStep, setBusyStep] = useState("");
  const infodata = buildUserBlockchainInfodata(draft);
  const privateKey = getDraftPrivateKey(draft);
  const canSendToBlockchain = signStatus === "valid" && !busyStep;

  async function signInfodata() {
    setBusyStep("sign");
    setSignStatus("");
    setCreateStatus("");
    setSignReturn(null);
    try {
      const response = await requestJson("/api/blockchain/chamhash", {
        method: "POST",
        body: JSON.stringify(buildUserChamhashPayload(draft))
      }, t);
      const result = response?.data || response;
      const isValid = result?.ok === true && Boolean(result?.xp);
      setSignReturn(result);
      setSignStatus(isValid ? "valid" : "invalid");
    } catch {
      setSignStatus("invalid");
    } finally {
      setBusyStep("");
    }
  }

  async function sendToBlockchain() {
    if (!signReturn?.xp) return;
    setBusyStep("send");
    setCreateStatus("");
    try {
      const sentResult = await sendDraftUserToBlockchain(draft, t, signReturn);
      setCreateStatus("created");
      if (typeof onSent === "function") onSent(sentResult.user);
    } catch (err) {
      const result = err?.payload?.data || err?.payload || {};
      const alreadyExists = result?.exist === true || result?.exists === true;
      setCreateStatus(alreadyExists || err.message === t("sendUserModal.userAlreadyOnBlockchain") ? "exists" : "failed");
    } finally {
      setBusyStep("");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="edit-modal">
        <header className="modal-header">
          <h2>{t("sendUserModal.title")}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </header>

        <div className="modal-body">
          <label>
            <span>{t("sendUserModal.infodata")}</span>
            <textarea value={JSON.stringify(infodata, null, 2)} readOnly rows={12} />
          </label>

          <label>
            <span>{t("sendUserModal.privateKey")}</span>
            <div className="secret-field">
              <input type={showPrivateKey ? "text" : "password"} value={privateKey} readOnly />
              <button
                className="secondary-action icon-action"
                type="button"
                onClick={() => setShowPrivateKey((current) => !current)}
                aria-label={showPrivateKey ? "Hide privateKey" : "Show privateKey"}
              >
                {showPrivateKey ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </label>

          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={signInfodata} disabled={busyStep === "sign"}>
              {t("sendUserModal.signInfodata")}
            </button>
            {signStatus && (
              <span className={`action-status ${signStatus === "valid" ? "ok" : "error"}`}>
                {signStatus === "valid" ? t("sendUserModal.validSign") : t("sendUserModal.invalidSign")}
              </span>
            )}
          </div>

          <div className="modal-action-line">
            <button
              className="secondary-action small-action"
              type="button"
              onClick={sendToBlockchain}
              disabled={!canSendToBlockchain}
            >
              {t("sendUserModal.sendToBlockchain")}
            </button>
            {createStatus && (
              <span className={`action-status ${createStatus === "created" ? "ok" : "error"}`}>
                {createStatus === "created"
                  ? t("sendUserModal.blockCreated")
                  : createStatus === "exists"
                    ? t("sendUserModal.userAlreadyOnBlockchain")
                    : t("sendUserModal.createdFail")}
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function UserCheckModal({ draft, onClose, t }) {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function checkUser() {
      setStatus("loading");
      setError("");
      try {
        const response = await requestJson("/api/blockchain/cuckoo-contains", {
          method: "POST",
          body: JSON.stringify({ user_data: draft.user_id })
        }, t);
        const result = response?.data || response;
        if (!ignore) setStatus(result?.exists === true ? "exists" : "notExists");
      } catch (err) {
        if (!ignore) {
          setError(err.message || t("userCheckModal.error"));
          setStatus("error");
        }
      }
    }

    checkUser();
    return () => {
      ignore = true;
    };
  }, [draft.user_id, t]);

  const isPositive = status === "exists";
  const message = status === "loading"
    ? t("userCheckModal.loading")
    : status === "error"
      ? error || t("userCheckModal.error")
      : isPositive
        ? t("userCheckModal.exists")
        : t("userCheckModal.notExists");

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="edit-modal">
        <header className="modal-header">
          <h2>{t("userCheckModal.title")}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </header>

        <div className="modal-body">
          <div className={`alert ${status !== "loading" && status !== "error" ? (isPositive ? "success" : "") : ""}`}>
            {message}
          </div>
          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={onClose}>
              {t("userCheckModal.ok")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AutomaticCreateUsersModal({ settings, onClose, onCreated, t }) {
  const [quantity, setQuantity] = useState(1);
  const [created, setCreated] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generateDraftField(draft, field) {
    const payload = await requestJson("/api/users/generate-field", {
      method: "POST",
      body: JSON.stringify({ field, user: draftToUserPayload(draft) })
    }, t);
    const value = payload.value;
    return typeof value === "object" ? jsonText(value) : String(value || "");
  }

  async function buildAutomaticUserDraft() {
    const nextDraft = emptyUserDraft();
    nextDraft.address = await generateDraftField(nextDraft, "address");
    nextDraft.name = await generateDraftField(nextDraft, "name");
    nextDraft.user_id = await generateDraftField(nextDraft, "user_id");
    nextDraft.tel = await generateDraftField(nextDraft, "tel");
    nextDraft.email = await generateDraftField(nextDraft, "email");

    const chHashPayload = await requestJson("/api/blockchain/chamkeygen", {
      method: "POST",
      body: JSON.stringify({ bits: Number(settings.chBits || 128) })
    }, t);
    const chHash = splitChHash(chHashPayload.data || chHashPayload);
    nextDraft.ch_hash_publicKey = chHash.publicKey;
    nextDraft.ch_hash_privateKey = chHash.privateKey;
    return nextDraft;
  }

  async function createUsers() {
    const total = Math.max(0, Number(quantity || 0));
    if (!total) return;
    setBusy(true);
    setError("");
    setCreated(0);
    try {
      for (let index = 0; index < total; index += 1) {
        const nextDraft = await buildAutomaticUserDraft();
        const payload = await requestJson("/api/users", {
          method: "POST",
          body: JSON.stringify(draftToUserPayload(nextDraft))
        }, t);
        if (typeof onCreated === "function") onCreated(payload.user);
        setCreated(index + 1);
      }
    } catch (err) {
      setError(t("autoUserModal.error", { message: err.message }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="edit-modal">
        <header className="modal-header">
          <h2>{t("autoUserModal.title")}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </header>

        <div className="modal-body">
          {error && <div className="alert">{error}</div>}
          <div className="auto-create-grid">
            <label>
              <span>{t("autoUserModal.usersQuantity")}</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                disabled={busy}
              />
            </label>
            <div className="auto-created-display">
              <span>{t("autoUserModal.created")}</span>
              <strong>{created}</strong>
            </div>
          </div>

          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={createUsers} disabled={busy}>
              {busy ? t("autoUserModal.creating") : t("autoUserModal.createUsers")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function BulkSendNotSentModal({ users, onClose, onSent, t }) {
  const [quantity, setQuantity] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(1);
  const [sentCount, setSentCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const canceledRef = useRef(false);

  function sanitizeInteger(value, fallback = 0) {
    const nextValue = Math.max(0, Math.floor(Number(value || fallback)));
    return Number.isFinite(nextValue) ? nextValue : fallback;
  }

  async function waitWithCountdown(seconds) {
    for (let remaining = seconds; remaining > 0; remaining -= 1) {
      if (canceledRef.current) return false;
      setCountdown(remaining);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setCountdown(0);
    return !canceledRef.current;
  }

  async function sendUsers() {
    const total = sanitizeInteger(quantity);
    const interval = sanitizeInteger(intervalSeconds, 1);
    if (!total) return;

    const queue = users.filter((user) => !Boolean(user.sent)).slice(0, total);
    setBusy(true);
    setTerminal(false);
    setStatus("");
    setError("");
    setSentCount(0);
    setCountdown(0);
    canceledRef.current = false;

    try {
      for (let index = 0; index < queue.length; index += 1) {
        if (canceledRef.current) break;
        const result = await sendDraftUserToBlockchain(userToDraft(queue[index]), t);
        if (typeof onSent === "function") onSent(result.user);
        setSentCount(index + 1);

        if (index < queue.length - 1) {
          const canContinue = await waitWithCountdown(interval);
          if (!canContinue) break;
        }
      }

      setBusy(false);
      setTerminal(true);
      setCountdown(0);
      setStatus(canceledRef.current ? "canceled" : "done");
    } catch (err) {
      setBusy(false);
      setTerminal(false);
      setCountdown(0);
      setStatus("error");
      setError(err.message || t("bulkSendModal.sendError"));
    }
  }

  function cancelSend() {
    canceledRef.current = true;
    setBusy(false);
    setTerminal(true);
    setCountdown(0);
    setStatus("canceled");
  }

  const disabled = busy || terminal;
  const canSend = sanitizeInteger(quantity) > 0 && !disabled;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="edit-modal">
        <header className="modal-header">
          <h2>{t("bulkSendModal.title")}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </header>

        <div className="modal-body">
          <div className="auto-create-grid">
            <label>
              <span>{t("bulkSendModal.quantity")}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={quantity}
                disabled={disabled}
                onChange={(event) => setQuantity(sanitizeInteger(event.target.value))}
              />
            </label>
            <label>
              <span>{t("bulkSendModal.interval")}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={intervalSeconds}
                disabled={disabled}
                onChange={(event) => setIntervalSeconds(sanitizeInteger(event.target.value, 1))}
              />
            </label>
          </div>

          <div className="users-summary-row">
            <div className="users-summary-item">
              <span>{t("bulkSendModal.sent")}</span>
              <strong>{sentCount}</strong>
            </div>
            <div className="users-summary-item">
              <span>{t("bulkSendModal.waiting")}</span>
              <strong>{countdown}</strong>
            </div>
          </div>

          {status === "done" && <div className="alert success">{t("bulkSendModal.usersSent")}</div>}
          {status === "canceled" && <div className="alert">{t("bulkSendModal.sendCanceled")}</div>}
          {status === "error" && <div className="alert">{t("bulkSendModal.sendError")}: {error}</div>}

          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={sendUsers} disabled={!canSend}>
              {t("bulkSendModal.send")}
            </button>
            <button className="secondary-action small-action" type="button" onClick={cancelSend} disabled={!busy || terminal}>
              {t("bulkSendModal.cancel")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function parseCertificateColor(color) {
  const match = String(color || "").match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return match ? match.slice(1).map((value) => Number.parseInt(value, 16)) : [21, 44, 69];
}

function getCertificatePdfFont(fontFamily) {
  const normalized = String(fontFamily || "").toLowerCase();
  if (normalized.includes("times") || normalized.includes("georgia")) return "times";
  if (normalized.includes("courier")) return "courier";
  return "helvetica";
}

function loadImageDimensions(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The certificate background image could not be loaded."));
    image.src = source;
  });
}

function isRightToBeForgottenBlock(details) {
  const infodata = parseJsonField(firstAvailableValue(details, [
    "infodata",
    "userdata.infodata",
    "data.infodata",
    "data.userdata.infodata"
  ]));
  return infodata?.deleted === true || String(infodata?.deleted).toLowerCase() === "true";
}

function getCertificateBlockValues(details, fallbackBlockNumber) {
  return {
    userIdNumber: firstAvailableValue(details, ["userdata_id", "userdata.id", "data.userdata_id", "data.userdata.id"]),
    userIdHash: firstAvailableValue(details, ["userdata_id_hash", "data.userdata_id_hash"]),
    rightCertificate: firstAvailableValue(details, ["cuckoofilter_hash", "data.cuckoofilter_hash"]),
    issuedOn: firstAvailableValue(details, ["time_stamp", "timestamp", "data.time_stamp", "data.timestamp"]),
    blockNumber: firstAvailableValue(details, ["block_number", "data.block_number"]) || fallbackBlockNumber
  };
}

function CertificatePdfModal({ details, blockNumber, onClose, t }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [userIdConfirmation, setUserIdConfirmation] = useState("");
  const [confirmedUserId, setConfirmedUserId] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const blockValues = useMemo(() => getCertificateBlockValues(details, blockNumber), [details, blockNumber]);
  const values = useMemo(() => ({
    ...blockValues,
    userIdNumber: confirmedUserId
  }), [blockValues, confirmedUserId]);

  useEffect(() => {
    let objectUrl = "";
    let canceled = false;

    if (!confirmedUserId) return undefined;

    async function generatePdf() {
      setStatus("loading");
      setError("");
      try {
        const response = await requestJson("/api/certificate-settings", {}, t);
        const certificate = response.certificate || {};
        if (!certificate.backgroundDataUrl) {
          if (!canceled) setStatus("missingBackground");
          return;
        }

        const { width, height } = await loadImageDimensions(certificate.backgroundDataUrl);
        const layout = normalizeCertificateLayout(certificate.layout);
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: width >= height ? "landscape" : "portrait",
          unit: "px",
          format: [width, height],
          hotfixes: ["px_scaling"],
          compress: true
        });
        pdf.addImage(certificate.backgroundDataUrl, "JPEG", 0, 0, width, height);

        CERTIFICATE_TEXT_FIELDS.forEach((field) => {
          const textStyle = layout[field.id];
          const [red, green, blue] = parseCertificateColor(textStyle.color);
          pdf.setTextColor(red, green, blue);
          pdf.setFont(getCertificatePdfFont(textStyle.fontFamily), "normal");
          pdf.setFontSize(Math.max(1, Number(textStyle.fontSize) || 1));
          pdf.text(
            String(values[field.id] ?? ""),
            Number(textStyle.horizontal) || 0,
            height - (Number(textStyle.vertical) || 0)
          );
        });

        objectUrl = URL.createObjectURL(pdf.output("blob"));
        if (!canceled) {
          setPdfUrl(objectUrl);
          setStatus("ready");
        }
      } catch (err) {
        if (!canceled) {
          setError(t("certificateModal.error", { message: err.message }));
          setStatus("error");
        }
      }
    }

    generatePdf();
    return () => {
      canceled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [confirmedUserId, t, values]);

  async function confirmUserId() {
    setError("");
    setIsConfirming(true);
    try {
      const [{ sha3_256 }, { bytesToHex, utf8ToBytes }] = await Promise.all([
        import("@noble/hashes/sha3"),
        import("@noble/hashes/utils")
      ]);
      const inputHash = bytesToHex(sha3_256(utf8ToBytes(userIdConfirmation)));
      const storedHash = String(blockValues.userIdHash ?? "").trim().replace(/^0x/i, "").toLowerCase();

      if (!storedHash || inputHash.toLowerCase() !== storedHash) {
        setConfirmedUserId("");
        setPdfUrl("");
        setStatus("idle");
        setError(t("certificateModal.userIdNotMatch"));
        return;
      }

      setConfirmedUserId(userIdConfirmation);
    } catch (err) {
      setError(t("certificateModal.error", { message: err.message }));
    } finally {
      setIsConfirming(false);
    }
  }

  function updateUserIdConfirmation(value) {
    setUserIdConfirmation(value);
    setError("");
    if (confirmedUserId) {
      setConfirmedUserId("");
      setPdfUrl("");
      setStatus("idle");
    }
  }

  function savePdf() {
    if (!pdfUrl) return;
    const download = document.createElement("a");
    download.href = pdfUrl;
    download.download = `right-to-be-forgotten-certificate-block-${values.blockNumber}.pdf`;
    download.click();
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="edit-modal certificate-pdf-modal">
        <header className="modal-header">
          <h2>{t("certificateModal.title")}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        </header>
        <div className="modal-body">
          <label className="settings-field">
            <span>{t("certificateModal.confirmUserId")}</span>
            <input
              type="text"
              value={userIdConfirmation}
              onChange={(event) => updateUserIdConfirmation(event.target.value)}
              autoFocus
            />
          </label>
          <div className="modal-action-line">
            <button
              className="secondary-action small-action"
              type="button"
              onClick={confirmUserId}
              disabled={!userIdConfirmation || isConfirming}
            >
              {isConfirming ? t("certificateModal.confirming") : t("certificateModal.confirm")}
            </button>
          </div>
          {error && <div className="alert">{error}</div>}
          {status === "loading" && <div className="detail-state">{t("certificateModal.generating")}</div>}
          {status === "missingBackground" && <div className="alert">{t("certificateModal.missingBackground")}</div>}
          {pdfUrl && <iframe className="certificate-pdf-frame" title={t("certificateModal.title")} src={pdfUrl} />}
          <div className="modal-action-line">
            <button className="secondary-action small-action" type="button" onClick={savePdf} disabled={!pdfUrl}>
              {t("certificateModal.save")}
            </button>
            <button className="secondary-action small-action" type="button" onClick={onClose}>
              {t("certificateModal.close")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function BlockDetails({ block, theme, t }) {
  const blockNumber = getBlockNumber(block);
  const [activeTab, setActiveTab] = useState("metadata");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoData, setInfoData] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isForgottenModalOpen, setIsForgottenModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  async function loadDetails({ showLoading = true, closeModal = true } = {}) {
    if (showLoading) setLoading(true);
    setError("");
    if (closeModal) {
      setIsEditModalOpen(false);
      setIsForgottenModalOpen(false);
      setIsCertificateModalOpen(false);
    }
    try {
      const payload = await requestJson("/api/blockchain/fullblockbyid", {
        method: "POST",
        body: JSON.stringify({ block_number: blockNumber })
      }, t);
      const detail = Array.isArray(payload.data) ? payload.data[0] : payload.data;
      setDetails(detail || {});
      setInfoData(fieldValue(detail || {}, ["infodata", "userdata.infodata"]));
      return true;
    } catch (err) {
      setError(err.message || t("blockDetails.loadError"));
      setDetails(null);
      return false;
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [blockNumber, t]);

  const tabs = [
    { id: "metadata", label: t("blockDetails.metadata") },
    { id: "userData", label: t("blockDetails.userData") },
    { id: "json", label: t("blockDetails.json") }
  ];
  const canIssueCertificate = isRightToBeForgottenBlock(details);

  if (loading) {
    return <div className="detail-state">{t("blockDetails.loading")}</div>;
  }

  if (error) {
    return <div className="alert">{error}</div>;
  }

  return (
    <div className="block-details">
      <div className="detail-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`detail-tab ${activeTab === tab.id ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <button
          className="detail-tab certificate-issue-button"
          type="button"
          disabled={!canIssueCertificate}
          onClick={() => setIsCertificateModalOpen(true)}
        >
          {t("blockDetails.issueCertificate")}
        </button>
      </div>

      {activeTab === "metadata" && (
        <div className="detail-grid">
          {METADATA_FIELDS.map(([label, paths]) => (
            <DetailField key={label} label={label} value={fieldValue(details, paths)} />
          ))}
        </div>
      )}

      {activeTab === "userData" && (
        <div className="detail-panel">
          <div className="detail-grid">
            {USER_DATA_FIELDS.map(([label, paths, type]) => {
              const isInfoData = label === "infodata";
              return (
                <DetailField
                  key={label}
                  label={label}
                  value={isInfoData ? infoData : fieldValue(details, paths)}
                  multiline={type === "textarea"}
                  readOnly
                />
              );
            })}
          </div>
          <div className="detail-actions">
            <button className="secondary-action" type="button" onClick={() => setIsEditModalOpen(true)}>
              {t("blockDetails.edit")}
            </button>
            <button className="secondary-action" type="button" disabled>
              {t("blockDetails.save")}
            </button>
            <button className="secondary-action" type="button" onClick={() => setIsForgottenModalOpen(true)}>
              {t("blockDetails.rightToBeForgotten")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "json" && (
        <div className="json-lite-panel">
          <JsonView
            data={details || {}}
            shouldExpandNode={allExpanded}
            style={theme === "light" ? defaultStyles : darkStyles}
          />
        </div>
      )}

      {isEditModalOpen && (
        <EditUserDataModal
          details={details}
          initialInfoData={infoData}
          onClose={() => setIsEditModalOpen(false)}
          onBlockReload={() => loadDetails({ showLoading: false, closeModal: false })}
          t={t}
        />
      )}

      {isForgottenModalOpen && (
        <RightToBeForgottenModal
          details={details}
          onClose={() => setIsForgottenModalOpen(false)}
          onBlockReload={() => loadDetails({ showLoading: false, closeModal: false })}
          t={t}
        />
      )}

      {isCertificateModalOpen && (
        <CertificatePdfModal
          details={details}
          blockNumber={blockNumber}
          onClose={() => setIsCertificateModalOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}

function Sidebar({ activeView, onChange, theme, t, isOpen, onClose }) {
  return (
    <aside className={`sidebar offcanvas-menu ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="brand">
        <div className="chain-logo" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <strong>LGPD Chain</strong>
          <small>{t("brand.subtitle")}</small>
        </div>
        <button className="offcanvas-close" type="button" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className="menu" aria-label="Main navigation">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`menu-button ${activeView === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => {
                onChange(item.id);
                onClose();
              }}
            >
              <Icon size={18} />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
        <span>{theme === "light" ? t("theme.light") : t("theme.dark")}</span>
      </div>
    </aside>
  );
}

function PresentationView({ html, t }) {
  return (
    <main className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">{t("presentation.eyebrow")}</p>
          <h1>{t("presentation.title")}</h1>
        </div>
      </header>
      <section className="presentation-content" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}

function DataVerificationView({ t, language }) {
  const [blockNumber, setBlockNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [userIdNumber, setUserIdNumber] = useState("");
  const [certificate, setCertificate] = useState("");
  const [verifyingRight, setVerifyingRight] = useState(false);
  const [rightResult, setRightResult] = useState(null);
  const [rightError, setRightError] = useState("");

  async function verifyBlock(event) {
    event.preventDefault();
    const numericBlockNumber = Number(blockNumber);
    if (!Number.isInteger(numericBlockNumber) || numericBlockNumber < 0) return;

    setVerifying(true);
    setResult(null);
    setError("");
    try {
      const payload = await requestJson("/api/blockchain/verifyblockbyid", {
        method: "POST",
        body: JSON.stringify({ block_number: numericBlockNumber })
      }, t);
      const valid = payload?.data?.valid ?? payload?.valid;
      setResult({
        blockNumber: numericBlockNumber,
        valid: valid === true || String(valid).toLowerCase() === "true"
      });
    } catch (err) {
      setError(t("dataVerification.error", { message: err.message }));
    } finally {
      setVerifying(false);
    }
  }

  async function verifyRightToBeForgotten(event) {
    event.preventDefault();
    if (!userIdNumber || !certificate) return;

    setVerifyingRight(true);
    setRightResult(null);
    setRightError("");
    try {
      const payload = await requestJson("/api/blockchain/checkrighttobeforgoten", {
        method: "POST",
        body: JSON.stringify({
          user_data: {
            user_data_id: userIdNumber,
            cuckoofilter_hash: certificate
          }
        })
      }, t);
      const data = payload?.data || payload;
      const success = data?.sucess === true || String(data?.sucess).toLowerCase() === "true";
      const message = language === "pt-BR" ? data?.message_pt : data?.message_en;
      setRightResult({
        success,
        message: message || t("dataVerification.rightInvalidResponse"),
        blockNumber: data?.block_number,
        timeStamp: data?.time_stamp
      });
    } catch (err) {
      setRightError(t("dataVerification.rightError", { message: err.message }));
    } finally {
      setVerifyingRight(false);
    }
  }

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">{t("dataVerification.eyebrow")}</p>
          <h1>{t("menu.dataVerification")}</h1>
        </div>
      </header>

      <div className="verification-cards">
        <section className="verification-card">
          <div className="verification-card-header">{t("dataVerification.cardHeader")}</div>
          <div className="verification-card-body">
            <h2>{t("dataVerification.cardTitle")}</h2>
            <p>{t("dataVerification.cardText")}</p>
            <form className="verification-form" onSubmit={verifyBlock}>
              <label>
                <span>{t("dataVerification.blockNumber")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={blockNumber}
                  onChange={(event) => setBlockNumber(event.target.value)}
                  required
                />
              </label>
              <button className="primary-action" type="submit" disabled={verifying || blockNumber === ""}>
                <ShieldCheck size={18} />
                <span>{verifying ? t("dataVerification.verifying") : t("dataVerification.verify")}</span>
              </button>
            </form>
            {error && <div className="alert">{error}</div>}
            {result && (
              <div className={`alert ${result.valid ? "success" : ""}`}>
                {result.valid
                  ? t("dataVerification.valid", { blockNumber: result.blockNumber })
                  : t("dataVerification.invalid", { blockNumber: result.blockNumber })}
              </div>
            )}
          </div>
        </section>

        <section className="verification-card">
          <div className="verification-card-header">{t("dataVerification.rightCardHeader")}</div>
          <div className="verification-card-body">
            <h2>{t("dataVerification.rightCardTitle")}</h2>
            <p>{t("dataVerification.rightCardText")}</p>
            <form className="verification-form verification-right-form" onSubmit={verifyRightToBeForgotten}>
              <label>
                <span>{t("dataVerification.userIdNumber")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder={t("dataVerification.onlyNumbers")}
                  value={userIdNumber}
                  onChange={(event) => setUserIdNumber(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>{t("dataVerification.certificate")}</span>
                <input
                  type="text"
                  inputMode="text"
                  placeholder={t("dataVerification.certificatePlaceholder")}
                  value={certificate}
                  onChange={(event) => setCertificate(event.target.value.replace(/[^0-9a-f]/gi, ""))}
                  required
                />
              </label>
              <button className="primary-action" type="submit" disabled={verifyingRight || !userIdNumber || !certificate}>
                <ShieldCheck size={18} />
                <span>{verifyingRight ? t("dataVerification.verifyingInBlockchain") : t("dataVerification.verifyInBlockchain")}</span>
              </button>
            </form>
            {rightError && <div className="alert">{rightError}</div>}
            {rightResult && (
              <div className={`alert ${rightResult.success ? "success" : ""}`}>
                <div>{rightResult.message}</div>
                {rightResult.success && rightResult.blockNumber !== undefined && rightResult.blockNumber !== null && (
                  <div>{t("dataVerification.blockNumberResult", { blockNumber: rightResult.blockNumber })}</div>
                )}
                {rightResult.success && rightResult.timeStamp !== undefined && rightResult.timeStamp !== null && (
                  <div>{t("dataVerification.timeStampResult", { timeStamp: rightResult.timeStamp })}</div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function BlocksView({ settings, t }) {
  const [blocks, setBlocks] = useState([]);
  const [filters, setFilters] = useState({ blockNumber: "", userdataAddress: "", from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const blocksRef = useRef([]);
  const settingsRef = useRef(settings);
  const tRef = useRef(t);
  const pollingRef = useRef(false);
  const lastSyncedHeadRef = useRef(null);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Requests the configured limited block list and keeps the UI capped to that same limit.
  async function fetchLimitedBlocks(successKey = "blocks.loaded") {
    const activeSettings = settingsRef.current;
    const translate = tRef.current;
    const limit = Number(activeSettings.blocksLimit || 100);
    const payload = await requestJson("/api/blockchain/blockslimit", {
      method: "POST",
      body: JSON.stringify({ blocks: limit })
    }, translate);
    const limitedBlocks = sortBlocksDescending(extractBlocks(payload)).slice(0, limit);
    setBlocks(limitedBlocks);
    setSuccessMessage(translate(successKey));
    return limitedBlocks;
  }

  // Loads the initial block list once when the application starts.
  async function loadInitialBlocks() {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setSyncMessage("");
    try {
      await fetchLimitedBlocks("blocks.loaded");
    } catch (err) {
      setError(err.message);
      setSuccessMessage("");
      setSyncMessage("");
    } finally {
      setLoading(false);
    }
  }

  // Keeps the block list synchronized by reloading only the configured amount of latest blocks.
  async function synchronizeLatestBlocks() {
    if (pollingRef.current || !blocksRef.current.length) return;
    pollingRef.current = true;
    try {
      const translate = tRef.current;
      const activeSettings = settingsRef.current;
      const limit = Number(activeSettings.blocksLimit || 100);
      const payload = await requestJson("/api/blockchain/lastblock", {}, translate);
      const lastNumber = getBlockNumber(payload);
      const currentNumber = Math.max(...blocksRef.current.map((block) => getBlockNumber(block) || 0));
      if (!lastNumber) {
        setError(translate("blocks.invalidLastBlock"));
        setSuccessMessage("");
        setSyncMessage("");
        return;
      }
      if (lastNumber <= currentNumber) {
        lastSyncedHeadRef.current = lastNumber;
        setError("");
        setSuccessMessage(translate("blocks.updated"));
        setSyncMessage("");
        return;
      }
      if (lastSyncedHeadRef.current === lastNumber) {
        setError("");
        setSuccessMessage(translate("blocks.updated"));
        setSyncMessage("");
        return;
      }

      setSyncing(true);
      setSuccessMessage("");
      setSyncMessage(translate("blocks.syncLimited", { limit }));
      await fetchLimitedBlocks("blocks.updated");
      lastSyncedHeadRef.current = lastNumber;
      setError("");
      setSyncMessage("");
    } catch (err) {
      setError(err.message);
      setSuccessMessage("");
      setSyncMessage("");
    } finally {
      setSyncing(false);
      pollingRef.current = false;
    }
  }

  useEffect(() => {
    loadInitialBlocks();
  }, [settings.blocksLimit, settings.blocksRoute]);

  useEffect(() => {
    const timer = window.setInterval(synchronizeLatestBlocks, 1000);
    return () => window.clearInterval(timer);
  }, []);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filteredBlocks = useMemo(
    () => blocks.filter((block) => blockMatchesFilters(block, filters)),
    [blocks, filters]
  );

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">{t("blocks.eyebrow")}</p>
          <h1>{t("blocks.title")}</h1>
        </div>
        <button className="primary-action" onClick={loadInitialBlocks} disabled={loading}>
          <RefreshCw size={18} />
          <span>{loading ? t("blocks.loading") : t("blocks.reload")}</span>
        </button>
      </header>

      <div className="toolbar-line">
        <StatusPill ok={!error}>{error ? t("blocks.accessError") : syncing ? t("blocks.updating") : successMessage || t("blocks.monitoring")}</StatusPill>
        <span>{t("blocks.count", { count: blocks.length })}</span>
      </div>
      {error && <div className="alert">{error}</div>}
      {!error && syncing && syncMessage && <div className="alert info">{syncMessage}</div>}
      {!error && successMessage && <div className="alert success">{successMessage}</div>}

      <section className="filters block-filters">
        <label>
          <span>{t("blocks.filterBlockNumber")}</span>
          <div className="input-with-icon">
            <Search size={16} />
            <input
              value={filters.blockNumber}
              onChange={(event) => updateFilter("blockNumber", event.target.value)}
              placeholder={t("blocks.filterBlockNumberPlaceholder")}
            />
          </div>
        </label>
        <label>
          <span>{t("blocks.filterUserDataAddress")}</span>
          <div className="input-with-icon">
            <Search size={16} />
            <input
              value={filters.userdataAddress}
              onChange={(event) => updateFilter("userdataAddress", event.target.value)}
              placeholder={t("blocks.filterUserDataAddressPlaceholder")}
            />
          </div>
        </label>
        <label>
          <span>{t("blocks.filterFrom")}</span>
          <input type="datetime-local" value={filters.from} onChange={(event) => updateFilter("from", event.target.value)} />
        </label>
        <label>
          <span>{t("blocks.filterTo")}</span>
          <input type="datetime-local" value={filters.to} onChange={(event) => updateFilter("to", event.target.value)} />
        </label>
      </section>

      <AccordionList
        items={filteredBlocks}
        emptyMessage={loading ? t("blocks.loadingList") : blocks.length ? t("blocks.filteredEmpty") : t("blocks.empty")}
        renderHeader={(block) => getBlockHeader(block, settings.language, t)}
        renderBody={(block) => <BlockDetails block={block} theme={settings.theme} t={t} />}
      />
    </main>
  );
}

function UsersView({ settings, t }) {
  const [users, setUsers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectionAnchorIndex, setSelectionAnchorIndex] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingField, setGeneratingField] = useState("");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [isAutomaticCreateModalOpen, setIsAutomaticCreateModalOpen] = useState(false);
  const [isBulkSendModalOpen, setIsBulkSendModalOpen] = useState(false);
  const [showChHashPrivateKey, setShowChHashPrivateKey] = useState(false);
  const [sentFilter, setSentFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const userSummary = useMemo(() => {
    const sentUsers = users.filter((user) => Boolean(user.sent)).length;
    return {
      totalUsers: users.length,
      sentUsers,
      notSentUsers: users.length - sentUsers
    };
  }, [users]);
  const visibleUsers = useMemo(
    () => {
      if (sentFilter === "sent") return users.filter((user) => Boolean(user.sent));
      if (sentFilter === "notSent") return users.filter((user) => !Boolean(user.sent));
      return users;
    },
    [users, sentFilter]
  );
  const selectedCount = selectedIndexes.length;
  const hasMultipleSelection = selectedCount > 1;
  const hasSingleSelection = selectedCount === 1;

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const payload = await requestJson("/api/users", {}, t);
      const nextUsers = payload.users || [];
      setUsers(nextUsers);
      const selected = nextUsers.find((user) => user.index === selectedIndex) || nextUsers[0] || null;
      setSelectedIndex(selected?.index || null);
      setSelectedIndexes(selected ? [selected.index] : []);
      setSelectionAnchorIndex(selected?.index || null);
      setDraft(userToDraft(selected));
    } catch (err) {
      setError(err.message || t("users.loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function applySelection(nextSelection, primaryUser, nextAnchorIndex = primaryUser?.index || null) {
    setSelectedIndexes(nextSelection);
    setSelectedIndex(primaryUser?.index || null);
    setSelectionAnchorIndex(nextAnchorIndex);
    setDraft(userToDraft(primaryUser));
    setIsSendModalOpen(false);
    setIsCheckModalOpen(false);
    setIsAutomaticCreateModalOpen(false);
    setIsBulkSendModalOpen(false);
    setShowChHashPrivateKey(false);
    setMessage("");
    setError("");
  }

  function selectUser(user, event) {
    if (event?.shiftKey) {
      const anchorIndex = selectionAnchorIndex ?? selectedIndex ?? user.index;
      const anchorPosition = visibleUsers.findIndex((item) => item.index === anchorIndex);
      const clickedPosition = visibleUsers.findIndex((item) => item.index === user.index);
      const start = Math.min(anchorPosition === -1 ? clickedPosition : anchorPosition, clickedPosition);
      const end = Math.max(anchorPosition === -1 ? clickedPosition : anchorPosition, clickedPosition);
      const rangeIndexes = visibleUsers.slice(start, end + 1).map((item) => item.index);
      const shouldSelectRange = !selectedIndexes.includes(user.index);
      const nextSelection = shouldSelectRange
        ? [...new Set([...selectedIndexes, ...rangeIndexes])]
        : selectedIndexes.filter((index) => !rangeIndexes.includes(index));
      applySelection(nextSelection, user, anchorIndex);
      return;
    }

    if (event?.ctrlKey || event?.metaKey) {
      const isSelected = selectedIndexes.includes(user.index);
      const nextSelection = isSelected
        ? selectedIndexes.filter((index) => index !== user.index)
        : [...selectedIndexes, user.index];
      const primaryUser = isSelected && nextSelection.length
        ? users.find((item) => item.index === nextSelection[nextSelection.length - 1])
        : isSelected
          ? null
          : user;
      applySelection(nextSelection, primaryUser, user.index);
      return;
    }

    applySelection([user.index], user, user.index);
  }

  function createUserDraft() {
    setSelectedIndex(null);
    setSelectedIndexes([]);
    setSelectionAnchorIndex(null);
    setDraft(emptyUserDraft());
    setIsSendModalOpen(false);
    setIsCheckModalOpen(false);
    setIsAutomaticCreateModalOpen(false);
    setIsBulkSendModalOpen(false);
    setShowChHashPrivateKey(false);
    setMessage("");
    setError("");
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateSentUser(user) {
    if (!user) return;
    setUsers((current) => current.map((item) => (item.index === user.index ? user : item)));
    setSelectedIndex(user.index);
    setSelectedIndexes([user.index]);
    setSelectionAnchorIndex(user.index);
    setDraft(userToDraft(user));
  }

  function addCreatedUser(user) {
    if (!user) return;
    setUsers((current) => {
      const exists = current.some((item) => item.index === user.index);
      return exists
        ? current.map((item) => (item.index === user.index ? user : item))
        : [...current, user].sort((left, right) => left.index - right.index);
    });
    setSelectedIndex(user.index);
    setSelectedIndexes([user.index]);
    setSelectionAnchorIndex(user.index);
    setDraft(userToDraft(user));
  }

  function updateChHashFields(value) {
    const chHash = splitChHash(value);
    setDraft((current) => ({
      ...current,
      ch_hash: jsonText(value),
      ch_hash_publicKey: chHash.publicKey,
      ch_hash_privateKey: chHash.privateKey
    }));
  }

  async function generateField(field) {
    if (!draft) return;
    setGeneratingField(field);
    setError("");
    setMessage("");
    try {
      if (field === "ch_hash") {
        const payload = await requestJson("/api/blockchain/chamkeygen", {
          method: "POST",
          body: JSON.stringify({ bits: Number(settings.chBits || 128) })
        }, t);
        updateChHashFields(payload.data || payload);
      } else {
        const payload = await requestJson("/api/users/generate-field", {
          method: "POST",
          body: JSON.stringify({ field, user: draftToUserPayload(draft) })
        }, t);
        const value = payload.value;
        updateDraft(field, typeof value === "object" ? jsonText(value) : String(value || ""));
      }
    } catch (err) {
      setError(t("users.generateError", { message: err.message }));
    } finally {
      setGeneratingField("");
    }
  }

  async function saveUser(event) {
    event.preventDefault();
    if (!draft || hasMultipleSelection) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const isNew = !draft.index;
      const payload = await requestJson(isNew ? "/api/users" : `/api/users/${draft.index}`, {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(draftToUserPayload(draft))
      }, t);
      const savedUser = payload.user;
      setUsers((current) => {
        const exists = current.some((user) => user.index === savedUser.index);
        return exists
          ? current.map((user) => (user.index === savedUser.index ? savedUser : user))
          : [...current, savedUser].sort((left, right) => left.index - right.index);
      });
      setSelectedIndex(savedUser.index);
      setSelectedIndexes([savedUser.index]);
      setSelectionAnchorIndex(savedUser.index);
      setDraft(userToDraft(savedUser));
      setMessage(t("users.saved"));
    } catch (err) {
      setError(t("users.saveError", { message: err.message }));
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser() {
    const indexesToDelete = selectedIndexes.length ? selectedIndexes : draft?.index ? [draft.index] : [];
    if (!indexesToDelete.length || !window.confirm(t("users.deleteConfirm"))) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      for (const index of indexesToDelete) {
        await requestJson(`/api/users/${index}`, { method: "DELETE" }, t);
      }
      const remainingUsers = users.filter((user) => !indexesToDelete.includes(user.index));
      setUsers(remainingUsers);
      const nextUser = remainingUsers[0] || null;
      setSelectedIndex(nextUser?.index || null);
      setSelectedIndexes(nextUser ? [nextUser.index] : []);
      setSelectionAnchorIndex(nextUser?.index || null);
      setDraft(userToDraft(nextUser));
      setMessage(t("users.deleted"));
    } catch (err) {
      setError(t("users.deleteError", { message: err.message }));
    } finally {
      setSaving(false);
    }
  }


  function FieldCreateButton({ field, label }) {
    const busy = generatingField === field;
    return (
      <button className="secondary-action small-action" type="button" onClick={() => generateField(field)} disabled={Boolean(generatingField)}>
        {busy ? t("users.generating") : label}
      </button>
    );
  }

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">{t("users.eyebrow")}</p>
          <h1>{t("users.title")}</h1>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="users-summary-panel">
        <div className="users-summary-row">
          <div className="users-summary-item">
            <span>{t("users.totalUsers")}</span>
            <strong>{userSummary.totalUsers}</strong>
          </div>
          <div className="users-summary-item">
            <span>{t("users.sentUsers")}</span>
            <strong>{userSummary.sentUsers}</strong>
          </div>
          <div className="users-summary-item">
            <span>{t("users.notSentUsers")}</span>
            <strong>{userSummary.notSentUsers}</strong>
          </div>
        </div>
        <div className="users-summary-row">
          <div className="users-summary-item">
            <span>{t("users.filter")}</span>
            <label className="summary-check">
              <input
                type="checkbox"
                checked={sentFilter === "sent"}
                onChange={(event) => setSentFilter(event.target.checked ? "sent" : "all")}
              />
              <span>{t("users.sent")}</span>
            </label>
            <label className="summary-check">
              <input
                type="checkbox"
                checked={sentFilter === "notSent"}
                onChange={(event) => setSentFilter(event.target.checked ? "notSent" : "all")}
              />
              <span>{t("users.notSent")}</span>
            </label>
          </div>
        </div>
      </section>

      <section className="users-layout">
        <aside className="users-list">
          <button className="primary-action create-user-button" type="button" onClick={createUserDraft}>
            <span>{t("users.createUser")}</span>
          </button>
          <button className="secondary-action create-user-button" type="button" onClick={() => setIsAutomaticCreateModalOpen(true)}>
            <span>{t("users.automaticCreateUser")}</span>
          </button>
          {loading && <div className="empty-state">{t("users.loading")}</div>}
          {!loading && !users.length && <div className="empty-state">{t("users.empty")}</div>}
          {visibleUsers.map((user) => (
            <button
              key={user.index}
              className={`user-list-button ${selectedIndexes.includes(user.index) ? "active" : ""}`}
              type="button"
              onClick={(event) => selectUser(user, event)}
            >
              <strong>{user.name}</strong>
              <span>{user.user_id}</span>
            </button>
          ))}
        </aside>

        <section className="users-editor form-section">
          {!draft && <div className="empty-state">{t("users.select")}</div>}
          {draft && (
            <form className="settings-form" onSubmit={saveUser}>
              <div className="form-grid users-form-grid">
                <label>
                  <span>{t("users.index")}</span>
                  <input value={draft.index || ""} readOnly />
                </label>
                <label>
                  <span>{t("users.sentToBlockchain")}</span>
                  <input type="checkbox" checked={Boolean(draft.sent)} readOnly disabled />
                </label>
                <label>
                  <span>{t("users.name")}</span>
                  <div className="field-with-action">
                    <input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
                    <FieldCreateButton field="name" label={t("users.create")} />
                  </div>
                </label>
                <label>
                  <span>{t("users.userId")}</span>
                  <div className="field-with-action">
                    <input value={draft.user_id} onChange={(event) => updateDraft("user_id", event.target.value)} />
                    <FieldCreateButton field="user_id" label={t("users.create")} />
                  </div>
                </label>
              </div>

              <label className="full-field">
                <span>{t("users.address")}</span>
                <div className="field-with-action textarea-action">
                  <textarea value={draft.address} onChange={(event) => updateDraft("address", event.target.value)} />
                  <FieldCreateButton field="address" label={t("users.create")} />
                </div>
              </label>

              <label className="full-field">
                <span>{t("users.tel")}</span>
                <div className="field-with-action textarea-action">
                  <textarea value={draft.tel} onChange={(event) => updateDraft("tel", event.target.value)} />
                  <FieldCreateButton field="tel" label={t("users.create")} />
                </div>
              </label>

              <label className="full-field">
                <span>{t("users.email")}</span>
                <div className="field-with-action textarea-action">
                  <textarea value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} />
                  <FieldCreateButton field="email" label={t("users.create")} />
                </div>
              </label>

              <label className="full-field">
                <span>{t("users.chHashPublicKey")}</span>
                <div className="field-with-action textarea-action">
                  <textarea
                    value={draft.ch_hash_publicKey}
                    rows={4}
                    onChange={(event) => updateDraft("ch_hash_publicKey", event.target.value)}
                  />
                  <FieldCreateButton field="ch_hash" label={t("users.getFromBlockchain")} />
                </div>
              </label>

              <label className="full-field">
                <span>{t("users.chHashPrivateKey")}</span>
                <div className="secret-field">
                  <input
                    type={showChHashPrivateKey ? "text" : "password"}
                    value={draft.ch_hash_privateKey}
                    onChange={(event) => updateDraft("ch_hash_privateKey", event.target.value)}
                  />
                  <button
                    className="secondary-action icon-action"
                    type="button"
                    onClick={() => setShowChHashPrivateKey((current) => !current)}
                    aria-label={showChHashPrivateKey ? "Hide privateKey" : "Show privateKey"}
                  >
                    {showChHashPrivateKey ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </label>

              <div className="form-actions">
                <button className="primary-action save-button" type="submit" disabled={saving || hasMultipleSelection}>
                  <Save size={18} />
                  <span>{saving ? t("users.saving") : t("users.save")}</span>
                </button>
                <button className="secondary-action danger-action" type="button" onClick={deleteUser} disabled={saving || (!draft.index && !selectedCount)}>
                  {t("users.delete")}
                </button>
                <button className="secondary-action" type="button" onClick={() => setIsSendModalOpen(true)} disabled={saving || !draft.index || !hasSingleSelection}>
                  {t("users.sendToBlockchain")}
                </button>
                <button className="secondary-action" type="button" onClick={() => setIsBulkSendModalOpen(true)} disabled={saving || hasMultipleSelection}>
                  {t("users.sendNotSentToBlockchain")}
                </button>
                <button className="secondary-action" type="button" onClick={() => setIsCheckModalOpen(true)} disabled={saving || !draft.index || !hasSingleSelection}>
                  {t("users.checkOnBlockchain")}
                </button>
              </div>
            </form>
          )}
        </section>
      </section>
      {isSendModalOpen && draft && (
        <SendUserToBlockchainModal
          draft={draft}
          onClose={() => setIsSendModalOpen(false)}
          onSent={updateSentUser}
          t={t}
        />
      )}
      {isCheckModalOpen && draft && (
        <UserCheckModal
          draft={draft}
          onClose={() => setIsCheckModalOpen(false)}
          t={t}
        />
      )}
      {isAutomaticCreateModalOpen && (
        <AutomaticCreateUsersModal
          settings={settings}
          onClose={() => setIsAutomaticCreateModalOpen(false)}
          onCreated={addCreatedUser}
          t={t}
        />
      )}
      {isBulkSendModalOpen && (
        <BulkSendNotSentModal
          users={users}
          onClose={() => setIsBulkSendModalOpen(false)}
          onSent={updateSentUser}
          t={t}
        />
      )}
    </main>
  );
}

function TransactionsView({ t, language }) {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ route: "", from: "", to: "", order: "desc" });
  const [database, setDatabase] = useState(null);

  // Applies route, date and order filters to the persisted API access records.
  async function loadLogs(nextFilters = filters) {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const payload = await requestJson(`/api/logs?${params.toString()}`, {}, t);
    setLogs(payload.logs || []);
    setDatabase(payload.database || null);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function updateFilter(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    loadLogs(next);
  }

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">{t("transactions.eyebrow")}</p>
          <h1>{t("transactions.title")}</h1>
        </div>
      </header>

      <section className="filters">
        <label>
          <span>{t("transactions.route")}</span>
          <div className="input-with-icon">
            <Search size={16} />
            <input value={filters.route} onChange={(event) => updateFilter("route", event.target.value)} placeholder={t("transactions.routePlaceholder")} />
          </div>
        </label>
        <label>
          <span>{t("transactions.from")}</span>
          <input type="datetime-local" value={filters.from} onChange={(event) => updateFilter("from", event.target.value)} />
        </label>
        <label>
          <span>{t("transactions.to")}</span>
          <input type="datetime-local" value={filters.to} onChange={(event) => updateFilter("to", event.target.value)} />
        </label>
        <label>
          <span>{t("transactions.order")}</span>
          <select value={filters.order} onChange={(event) => updateFilter("order", event.target.value)}>
            <option value="desc">{t("transactions.newest")}</option>
            <option value="asc">{t("transactions.oldest")}</option>
          </select>
        </label>
      </section>

      {database && !database.ok && <div className="alert">{database.message}</div>}

      <AccordionList
        items={logs}
        emptyMessage={t("transactions.empty")}
        renderHeader={(log) => `${log.method} ${log.route} - ${new Date(log.created_at).toLocaleString(language === "pt-BR" ? "pt-BR" : "en-US")}`}
        renderBody={(log) => (
          <div className="log-detail">
            <StatusPill ok={log.success}>{log.success ? t("status.success") : t("status.failure")}</StatusPill>
            <JsonViewer
              value={{
                id: log.id,
                route: log.route,
                method: log.method,
                status_code: log.status_code,
                request_json: log.request_json,
                response_json: log.response_json,
                error_message: log.error_message,
                created_at: log.created_at
              }}
            />
          </div>
        )}
      />
    </main>
  );
}

function SettingsView({ settings, database, onSaved, onLanguagePreview, t }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [certificate, setCertificate] = useState(() => ({ backgroundDataUrl: "", layout: createDefaultCertificateLayout() }));
  const [certificateLoading, setCertificateLoading] = useState(true);
  const [certificateError, setCertificateError] = useState("");
  const [certificateBackgroundChanged, setCertificateBackgroundChanged] = useState(false);
  const [certificateTextId, setCertificateTextId] = useState(CERTIFICATE_TEXT_FIELDS[0].id);
  const [certificateDimensions, setCertificateDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    async function loadCertificateSettings() {
      try {
        const payload = await requestJson("/api/certificate-settings", {}, t);
        setCertificate({
          backgroundDataUrl: payload.certificate?.backgroundDataUrl || "",
          layout: normalizeCertificateLayout(payload.certificate?.layout)
        });
      } catch (err) {
        setCertificateError(t("certificate.loadError", { message: err.message }));
      } finally {
        setCertificateLoading(false);
      }
    }

    loadCertificateSettings();
  }, []);

  function changeField(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "language") {
        onLanguagePreview(value, next);
      }
      return next;
    });
  }

  function changeCertificateTextSetting(key, value) {
    setCertificate((current) => ({
      ...current,
      layout: {
        ...current.layout,
        [certificateTextId]: {
          ...DEFAULT_CERTIFICATE_TEXT_LAYOUT,
          ...(current.layout[certificateTextId] || {}),
          [key]: value
        }
      }
    }));
  }

  function loadCertificateBackground(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const isJpg = file.name.toLowerCase().endsWith(".jpg") && ["image/jpeg", "image/pjpeg", ""].includes(file.type);
    if (!isJpg) {
      setCertificateError(t("certificate.invalidFile"));
      setCertificate((current) => ({ ...current, backgroundDataUrl: "" }));
      setCertificateDimensions({ width: 0, height: 0 });
      setCertificateBackgroundChanged(true);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCertificate((current) => ({ ...current, backgroundDataUrl: String(reader.result || "") }));
      setCertificateError("");
      setCertificateBackgroundChanged(true);
    };
    reader.readAsDataURL(file);
  }

  // Saves configuration values in SQLite and updates the active React language/theme.
  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = await requestJson("/api/settings", {
        method: "PUT",
        body: JSON.stringify(form)
      }, t);
      const certificatePayload = { layout: certificate.layout };
      if (certificateBackgroundChanged) certificatePayload.backgroundDataUrl = certificate.backgroundDataUrl;
      await requestJson("/api/certificate-settings", {
        method: "PUT",
        body: JSON.stringify(certificatePayload)
      }, t);
      setCertificateBackgroundChanged(false);
      onSaved(payload.settings);
      window.alert(t("settings.saveSuccess"));
    } catch (err) {
      const message = err.message || t("certificate.saveError", { message: "" });
      setCertificateError(t("certificate.saveError", { message }));
      window.alert(t("settings.saveFailure", { message }));
    } finally {
      setSaving(false);
    }
  }

  const selectedCertificateText = CERTIFICATE_TEXT_FIELDS.find((field) => field.id === certificateTextId) || CERTIFICATE_TEXT_FIELDS[0];
  const selectedCertificateLayout = certificate.layout[certificateTextId] || DEFAULT_CERTIFICATE_TEXT_LAYOUT;
  const canAdjustCertificate = Boolean(certificate.backgroundDataUrl && certificateDimensions.width && certificateDimensions.height);

  return (
    <main className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">{t("settings.eyebrow")}</p>
          <h1>{t("settings.title")}</h1>
        </div>
        <StatusPill ok={database?.ok}>{database?.ok ? t("settings.sqliteConnected") : t("settings.sqliteUnavailable")}</StatusPill>
      </header>

      {database && !database.ok && <div className="alert">{database.message}</div>}

      <form className="settings-form" onSubmit={saveSettings}>
        <section className="form-section">
          <h2><Database size={18} /> {t("settings.localDatabase")}</h2>
          <div className="form-grid">
            <label>
              <span>SQLite</span>
              <input value={form.sqliteFile || "server/front.sqlite"} readOnly />
            </label>
          </div>
        </section>

        <section className="form-section">
          <h2><Blocks size={18} /> {t("settings.blockchainApis")}</h2>
          <div className="form-grid">
            <label>
              <span>{t("settings.apiHost")}</span>
              <input value={form.apiHost || ""} onChange={(event) => changeField("apiHost", event.target.value)} />
            </label>
            <label>
              <span>{t("settings.apiPort")}</span>
              <input type="number" value={form.apiPort || ""} onChange={(event) => changeField("apiPort", event.target.value)} />
            </label>
            <label>
              <span>{t("settings.blocksRoute")}</span>
              <input value={form.blocksRoute || ""} onChange={(event) => changeField("blocksRoute", event.target.value)} />
            </label>
            <label>
              <span>{t("settings.blocksLimit")}</span>
              <input type="number" min="1" value={form.blocksLimit || ""} onChange={(event) => changeField("blocksLimit", event.target.value)} />
            </label>
            <label>
              <span>{t("settings.chBits")}</span>
              <input type="number" min="1" value={form.chBits || ""} onChange={(event) => changeField("chBits", event.target.value)} />
            </label>
            <label>
              <span>{t("settings.lastBlockRoute")}</span>
              <input value={form.lastBlockRoute || ""} onChange={(event) => changeField("lastBlockRoute", event.target.value)} />
            </label>
            <label>
              <span>{t("settings.blockByIdRoute")}</span>
              <input value={form.blockByIdRoute || ""} onChange={(event) => changeField("blockByIdRoute", event.target.value)} />
            </label>
          </div>
          <label className="full-field">
            <span>{t("settings.internalRoutes")}</span>
            <textarea
              value={Array.isArray(form.internalRoutes) ? form.internalRoutes.join("\n") : form.internalRoutes || ""}
              onChange={(event) => changeField("internalRoutes", event.target.value)}
              rows={5}
            />
          </label>
        </section>

        <section className="form-section">
          <h2><Settings size={18} /> {t("settings.interface")}</h2>
          <div className="form-grid compact">
            <label>
              <span>{t("settings.theme")}</span>
              <select value={form.theme || "dark"} onChange={(event) => changeField("theme", event.target.value)}>
                <option value="dark">{t("settings.dark")}</option>
                <option value="light">{t("settings.light")}</option>
              </select>
            </label>
          </div>

          <fieldset className="radio-field">
            <legend>{t("settings.languages")}</legend>
            <label>
              <input
                type="radio"
                name="language"
                value="en"
                checked={(form.language || "en") === "en"}
                onChange={(event) => changeField("language", event.target.value)}
              />
              <span>{t("settings.english")}</span>
            </label>
            <label>
              <input
                type="radio"
                name="language"
                value="pt-BR"
                checked={form.language === "pt-BR"}
                onChange={(event) => changeField("language", event.target.value)}
              />
              <span>{t("settings.portuguese")}</span>
            </label>
          </fieldset>

          <label className="full-field">
            <span>{t("settings.presentationHtmlEn")}</span>
            <textarea value={form.presentationHtmlEn || ""} onChange={(event) => changeField("presentationHtmlEn", event.target.value)} rows={8} />
          </label>
          <label className="full-field">
            <span>{t("settings.presentationHtmlPt")}</span>
            <textarea value={form.presentationHtmlPt || ""} onChange={(event) => changeField("presentationHtmlPt", event.target.value)} rows={8} />
          </label>
        </section>

        <section className="form-section certificate-section">
          <h2><Award size={18} /> {t("certificate.title")}</h2>
          <div className="certificate-editor">
            <div className="certificate-controls">
              <label>
                <span>{t("certificate.textToEdit")}</span>
                <select
                  value={certificateTextId}
                  onChange={(event) => setCertificateTextId(event.target.value)}
                  disabled={!canAdjustCertificate || certificateLoading}
                >
                  {CERTIFICATE_TEXT_FIELDS.map((field) => (
                    <option key={field.id} value={field.id}>{t(field.labelKey)}</option>
                  ))}
                </select>
              </label>

              <div className="certificate-control-grid">
                <label>
                  <span>{t("certificate.textColor")}</span>
                  <input
                    type="color"
                    value={selectedCertificateLayout.color}
                    onChange={(event) => changeCertificateTextSetting("color", event.target.value)}
                    disabled={!canAdjustCertificate}
                  />
                </label>
                <label>
                  <span>{t("certificate.fontFamily")}</span>
                  <select
                    value={selectedCertificateLayout.fontFamily}
                    onChange={(event) => changeCertificateTextSetting("fontFamily", event.target.value)}
                    disabled={!canAdjustCertificate}
                  >
                    {["Arial", "Georgia", "Times New Roman", "Verdana", "Courier New", "sans-serif"].map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t("certificate.fontSize")}</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={selectedCertificateLayout.fontSize}
                    onChange={(event) => changeCertificateTextSetting("fontSize", Number(event.target.value || 1))}
                    disabled={!canAdjustCertificate}
                  />
                </label>
              </div>

              <label>
                <span>{t("certificate.horizontal")}</span>
                <input
                  type="range"
                  min="0"
                  max={certificateDimensions.width || 0}
                  step={Math.max(1, Number(selectedCertificateLayout.horizontalStep) || 1)}
                  value={Math.min(Number(selectedCertificateLayout.horizontal) || 0, certificateDimensions.width || 0)}
                  onChange={(event) => changeCertificateTextSetting("horizontal", Number(event.target.value))}
                  disabled={!canAdjustCertificate}
                />
              </label>
              <label>
                <span>{t("certificate.horizontalStep")}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={selectedCertificateLayout.horizontalStep}
                  onChange={(event) => changeCertificateTextSetting("horizontalStep", Math.max(1, Number(event.target.value || 1)))}
                  disabled={!canAdjustCertificate}
                />
              </label>
              <label>
                <span>{t("certificate.vertical")}</span>
                <input
                  type="range"
                  min="0"
                  max={certificateDimensions.height || 0}
                  step={Math.max(1, Number(selectedCertificateLayout.verticalStep) || 1)}
                  value={Math.min(Number(selectedCertificateLayout.vertical) || 0, certificateDimensions.height || 0)}
                  onChange={(event) => changeCertificateTextSetting("vertical", Number(event.target.value))}
                  disabled={!canAdjustCertificate}
                />
              </label>
              <label>
                <span>{t("certificate.verticalStep")}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={selectedCertificateLayout.verticalStep}
                  onChange={(event) => changeCertificateTextSetting("verticalStep", Math.max(1, Number(event.target.value || 1)))}
                  disabled={!canAdjustCertificate}
                />
              </label>
              <label>
                <span>{t("certificate.background")}</span>
                <input type="file" accept=".jpg,image/jpeg" onChange={loadCertificateBackground} />
              </label>
              {certificateError && <div className="alert">{certificateError}</div>}
            </div>

            <div className="certificate-preview" aria-live="polite">
              {!certificate.backgroundDataUrl && <div className="empty-state">{t("certificate.noImage")}</div>}
              {certificate.backgroundDataUrl && (
                <>
                  <img
                    src={certificate.backgroundDataUrl}
                    alt={t("certificate.title")}
                    onLoad={(event) => setCertificateDimensions({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight
                    })}
                  />
                  {canAdjustCertificate && (
                    <svg
                      className="certificate-text-overlay"
                      viewBox={`0 0 ${certificateDimensions.width} ${certificateDimensions.height}`}
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <text
                        x={selectedCertificateLayout.horizontal}
                        y={certificateDimensions.height - selectedCertificateLayout.vertical}
                        fill={selectedCertificateLayout.color}
                        fontFamily={selectedCertificateLayout.fontFamily}
                        fontSize={selectedCertificateLayout.fontSize}
                      >
                        {selectedCertificateText.value}
                      </text>
                    </svg>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <button className="primary-action save-button" type="submit" disabled={saving || certificateLoading}>
          <Save size={18} />
          <span>{saving ? t("settings.saving") : t("settings.save")}</span>
        </button>
      </form>
    </main>
  );
}

function App() {
  const [activeView, setActiveView] = useState("presentation");
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [database, setDatabase] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bootError, setBootError] = useState("");

  const t = useMemo(() => makeTranslator(settings.language || "en"), [settings.language]);

  useEffect(() => {
    requestJson("/api/settings", {}, t)
      .then((payload) => {
        const nextSettings = { ...EMPTY_SETTINGS, ...(payload.settings || {}) };
        nextSettings.presentationHtml = currentPresentationHtml(nextSettings);
        setSettings(nextSettings);
        setDatabase(payload.database || null);
      })
      .catch((err) => setBootError(err.message));
  }, []);

  function previewLanguage(language, draftSettings) {
    setSettings((current) => {
      const next = { ...current, ...draftSettings, language };
      next.presentationHtml = currentPresentationHtml(next);
      return next;
    });
  }

  function saveSettings(nextSettings) {
    const merged = { ...EMPTY_SETTINGS, ...nextSettings };
    merged.presentationHtml = currentPresentationHtml(merged);
    setSettings(merged);
  }

  const content = useMemo(() => {
    if (activeView === "blocks") return <BlocksView settings={settings} t={t} />;
    if (activeView === "transactions") return <TransactionsView t={t} language={settings.language} />;
    if (activeView === "users") return <UsersView settings={settings} t={t} />;
    if (activeView === "dataVerification") return <DataVerificationView t={t} language={settings.language} />;
    if (activeView === "settings") {
      return (
        <SettingsView
          settings={settings}
          database={database}
          onSaved={saveSettings}
          onLanguagePreview={previewLanguage}
          t={t}
        />
      );
    }
    return <PresentationView html={currentPresentationHtml(settings)} t={t} />;
  }, [activeView, settings, database, t]);

  return (
    <div className={`app-shell ${settings.theme === "light" ? "light" : "dark"}`}>
      <button
        className="navbar-toggle"
        type="button"
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <Menu size={24} />
      </button>
      {isMenuOpen && <button className="offcanvas-backdrop" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close menu" />}
      <Sidebar
        activeView={activeView}
        onChange={setActiveView}
        theme={settings.theme}
        t={t}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <div className="content-panel">
        {bootError ? <div className="alert boot-alert">{bootError}</div> : content}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
