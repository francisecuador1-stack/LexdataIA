import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';


// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

enum _SendStatus { sending, sent, error }

class _NormativeCitation {
  const _NormativeCitation({
    required this.label,
    required this.hashSha256,
    this.normaId,
  });

  final String label;
  final String hashSha256;
  final String? normaId;
}

class _ChatMessage {
  _ChatMessage({
    required this.id,
    required this.text,
    required this.isAgent,
    required this.time,
    this.sendStatus,
    this.citations = const [],
    this.isStreaming = false,
  });

  final String id;
  String text;
  final bool isAgent;
  final String time;
  _SendStatus? sendStatus;
  final List<_NormativeCitation> citations;
  bool isStreaming;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

/// Tracks network connectivity (simplified; replace with connectivity_plus).
final _connectivityProvider = StateProvider<bool>((ref) => true);

/// Chat messages keyed by client id.
final _chatMessagesProvider =
    StateNotifierProvider<_ChatNotifier, List<_ChatMessage>>(
  (ref) => _ChatNotifier(),
);

class _ChatNotifier extends StateNotifier<List<_ChatMessage>> {
  _ChatNotifier() : super([_buildGreeting()]);

  static _ChatMessage _buildGreeting() => _ChatMessage(
        id: 'greeting',
        text: 'Hola, soy MARK AI — Agente DPO Operativo de LEXDATA. '
            'Estoy ejecutando revisiones normativas en tiempo real sobre '
            'todas las fases del sistema. El DPO humano supervisa '
            'estratégicamente; yo me encargo de toda la operativa: '
            'análisis, observaciones, documentación y coordinación con '
            'los agentes de los clientes. ¿En qué puedo ayudarte?',
        isAgent: true,
        time: _nowTime(),
      );

  /// Send a user message and get a mock agent response.
  Future<void> send(String text) async {
    final userMsg = _ChatMessage(
      id: 'u_${DateTime.now().millisecondsSinceEpoch}',
      text: text,
      isAgent: false,
      time: _nowTime(),
      sendStatus: _SendStatus.sending,
    );
    state = [...state, userMsg];

    // Simulate network delay for send confirmation.
    await Future.delayed(const Duration(milliseconds: 400));
    userMsg.sendStatus = _SendStatus.sent;
    state = [...state];

    // Build agent response (mock SSE streaming).
    await _streamMockResponse(text);
  }

  Future<void> _streamMockResponse(String userText) async {
    final (responseText, citations) = _mockResponse(userText);

    final agentMsg = _ChatMessage(
      id: 'a_${DateTime.now().millisecondsSinceEpoch}',
      text: '',
      isAgent: true,
      time: _nowTime(),
      citations: citations,
      isStreaming: true,
    );
    state = [...state, agentMsg];

    // Simulate SSE token-by-token streaming.
    final words = responseText.split(' ');
    for (var i = 0; i < words.length; i++) {
      await Future.delayed(const Duration(milliseconds: 35));
      agentMsg.text += (i == 0 ? '' : ' ') + words[i];
      state = [...state];
    }

    agentMsg.isStreaming = false;
    state = [...state];
  }

  /// Returns (responseText, citations) based on the user question.
  (String, List<_NormativeCitation>) _mockResponse(String userText) {
    final lower = userText.toLowerCase();

    if (lower.contains('brechas críticas') || lower.contains('brechas criticas')) {
      return (
        'Se detectaron 3 brechas críticas en la revisión automática del ciclo actual:\n\n'
            '1. Tratamiento TRT-0042 (Marketing Digital): consentimiento no específico — '
            'el formulario web recopila datos de salud sin consentimiento explícito separado. '
            'Nivel de riesgo: CRÍTICO.\n\n'
            '2. Transferencia internacional TI-0018 (proveedor AWS US-East): falta cláusula '
            'contractual tipo aprobada por la SPDP. Nivel de riesgo: ALTO.\n\n'
            '3. Incidente INC-0007 detectado hace 48h — quedan 24h para notificación '
            'obligatoria a la SPDP conforme al Art. 41 LOPDP. Requiere acción inmediata del DPO.\n\n'
            'Recomiendo priorizar el incidente INC-0007 por el plazo legal de 72 horas.',
        [
          const _NormativeCitation(
            label: 'Art. 41 LOPDP — Notificación de vulneraciones',
            hashSha256: 'a3f7c9e1b24d6850f3ae9c7d1b5e4f28a0c6d9e3f7b2a5d8c1e4f7a0b3d6e9f2',
            normaId: 'lopdp-art-41',
          ),
          const _NormativeCitation(
            label: 'Art. 37 LOPDP — Medidas de seguridad',
            hashSha256: 'b4e8d0f2c35e7961g4bf0d8e2c6f5g39b1d7e0f4g8c3b6e9d2f5g8b1c4e7f0a3',
            normaId: 'lopdp-art-37',
          ),
        ],
      );
    }

    if (lower.contains('estado del rat') || lower.contains('rat')) {
      return (
        'El Registro de Actividades de Tratamiento (RAT) cuenta actualmente con 47 tratamientos '
            'registrados para el cliente activo.\n\n'
            '• 38 tratamientos VIGENTES con documentación completa.\n'
            '• 5 tratamientos CON OBSERVACIONES (bloqueados para avance de fase — RN-401).\n'
            '• 4 tratamientos PENDIENTES de validación del DPO.\n\n'
            'Los 5 tratamientos con observaciones requieren intervención del DPO humano para '
            'su resolución antes de continuar el ciclo PHVA.',
        [
          const _NormativeCitation(
            label: 'Art. 47 LOPDP — Registro de actividades de tratamiento',
            hashSha256: 'c5f9e1g3d46f8072h5cg1e9f3d7g6h40c2e8f1g5h9d4c7f0e3g6h9c2d5f8g1a4',
            normaId: 'lopdp-art-47',
          ),
        ],
      );
    }

    if (lower.contains('documentos pendientes')) {
      return (
        'Hay 12 documentos pendientes de aprobación por el DPO:\n\n'
            '• 4 Evaluaciones de Impacto (EIPD) en estado BORRADOR.\n'
            '• 3 Políticas de privacidad actualizadas sin firma.\n'
            '• 2 Contratos de encargado de tratamiento (DPA) pendientes de revisión legal.\n'
            '• 3 Actas de capacitación sin certificado generado.\n\n'
            'Las EIPD son prioritarias por estar asociadas a tratamientos de riesgo ALTO.',
        [],
      );
    }

    // Default response without citations triggers the warning.
    return (
      'Entendido. Estoy procesando tu consulta. Actualmente no dispongo de una respuesta '
          'estructurada para esa pregunta específica. Te sugiero formularla con mayor detalle '
          'o consultar las preguntas rápidas disponibles para obtener información precisa del sistema.',
      [],
    );
  }

  /// Wipe history on logout.
  void clearHistory() {
    state = [_buildGreeting()];
  }

  static String _nowTime() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class AgenteScreen extends ConsumerStatefulWidget {
  const AgenteScreen({super.key});

  @override
  ConsumerState<AgenteScreen> createState() => _AgenteScreenState();
}

class _AgenteScreenState extends ConsumerState<AgenteScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  bool _isListening = false;

  static const _quickQuestions = [
    '¿Hay brechas críticas?',
    'Estado del RAT',
    'Documentos pendientes',
    'Estado ARCO-PS',
    'DPAs sin firmar',
    '¿Próxima auditoría?',
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    final isOnline = ref.read(_connectivityProvider);
    if (!isOnline) return;

    _controller.clear();
    _focusNode.requestFocus();

    await ref.read(_chatMessagesProvider.notifier).send(text.trim());
    _scrollToBottom();
  }

  void _toggleVoiceInput() {
    setState(() {
      _isListening = !_isListening;
    });

    if (_isListening) {
      // TODO: integrate speech_to_text package
      // Mock: stop after 3 seconds with placeholder text.
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted && _isListening) {
          setState(() {
            _isListening = false;
            _controller.text = '¿Hay brechas críticas?';
            _controller.selection = TextSelection.fromPosition(
              TextPosition(offset: _controller.text.length),
            );
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(_chatMessagesProvider);
    final isOnline = ref.watch(_connectivityProvider);

    // Auto-scroll when messages change.
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          // Offline banner
          if (!isOnline) _buildOfflineBanner(),

          // Chat messages
          Expanded(
            child: GestureDetector(
              onTap: () => _focusNode.unfocus(),
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final msg = messages[index];
                  return _ChatBubble(
                    message: msg,
                    onCitationTap: _onCitationTap,
                  );
                },
              ),
            ),
          ),

          // Quick-question chips
          if (isOnline) _buildQuickChips(),

          // Permanent footer disclaimer — INV-5
          _buildDisclaimer(),

          // Input bar
          _buildInputBar(isOnline),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppColors.navy900,
      foregroundColor: Colors.white,
      elevation: 0,
      title: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: AppColors.blue600.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.smart_toy, size: 20, color: AppColors.blue300),
          ),
          const SizedBox(width: 10),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MARK AI',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              Text(
                'Agente DPO Operativo',
                style: TextStyle(fontSize: 11, color: AppColors.blue300),
              ),
            ],
          ),
          const Spacer(),
          // Connection indicator
          Consumer(
            builder: (context, ref, _) {
              final online = ref.watch(_connectivityProvider);
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: online ? AppColors.green600 : AppColors.red500,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    online ? 'En línea' : 'Sin conexión',
                    style: TextStyle(
                      fontSize: 11,
                      color: online ? AppColors.green600 : AppColors.red500,
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
      actions: [
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          onSelected: (value) {
            if (value == 'clear') {
              ref.read(_chatMessagesProvider.notifier).clearHistory();
            }
          },
          itemBuilder: (_) => [
            const PopupMenuItem(
              value: 'clear',
              child: Row(
                children: [
                  Icon(Icons.delete_outline, size: 18, color: AppColors.slate600),
                  SizedBox(width: 8),
                  Text('Limpiar historial'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOfflineBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: AppColors.amber500.withValues(alpha: 0.15),
      child: const Row(
        children: [
          Icon(Icons.wifi_off, size: 18, color: AppColors.amber600),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Sin conexión a internet. El chat con MARK AI requiere conexión activa al servidor '
              '— no se realiza inferencia local.',
              style: TextStyle(fontSize: 12, color: AppColors.amber600, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: _quickQuestions.map((q) {
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ActionChip(
              label: Text(q, style: const TextStyle(fontSize: 12, color: AppColors.blue600)),
              backgroundColor: AppColors.blue50,
              side: const BorderSide(color: AppColors.blue300, width: 0.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              onPressed: () => _sendMessage(q),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDisclaimer() {
    // INV-5: MARK AI no puede aprobar, cerrar, firmar.
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      color: AppColors.blue50,
      child: const Row(
        children: [
          Icon(Icons.verified_user_outlined, size: 14, color: AppColors.slate500),
          SizedBox(width: 6),
          Expanded(
            child: Text(
              'MARK AI propone y documenta; las aprobaciones, cierres y firmas son del DPO humano.',
              style: TextStyle(fontSize: 11, color: AppColors.slate600),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar(bool isOnline) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        8,
        10,
        8,
        10 + MediaQuery.of(context).padding.bottom,
      ),
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(top: BorderSide(color: AppColors.slate200)),
      ),
      child: Row(
        children: [
          // Voice input button
          _VoiceButton(
            isListening: _isListening,
            enabled: isOnline,
            onPressed: isOnline ? _toggleVoiceInput : null,
          ),
          const SizedBox(width: 4),
          Expanded(
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              enabled: isOnline,
              textInputAction: TextInputAction.send,
              onSubmitted: _sendMessage,
              decoration: InputDecoration(
                hintText: isOnline
                    ? 'Escribe a MARK AI…'
                    : 'Chat deshabilitado sin conexión',
                hintStyle: const TextStyle(fontSize: 14, color: AppColors.slate400),
                filled: true,
                fillColor: isOnline ? AppColors.bg : AppColors.slate200.withValues(alpha: 0.5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.slate200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.slate200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.blue600, width: 1.5),
                ),
                disabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.slate200),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                isDense: true,
              ),
            ),
          ),
          const SizedBox(width: 6),
          IconButton.filled(
            icon: const Icon(Icons.send, size: 20),
            style: IconButton.styleFrom(
              backgroundColor: isOnline ? AppColors.blue600 : AppColors.slate400,
              foregroundColor: Colors.white,
              minimumSize: const Size(42, 42),
            ),
            onPressed: isOnline ? () => _sendMessage(_controller.text) : null,
          ),
        ],
      ),
    );
  }

  void _onCitationTap(_NormativeCitation citation) {
    // Navigate to offline norma detail module.
    // TODO: connect to go_router navigation for norma detail screen.
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _CitationDetailSheet(citation: citation),
    );
  }
}

// ---------------------------------------------------------------------------
// Chat bubble widget
// ---------------------------------------------------------------------------

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({
    required this.message,
    required this.onCitationTap,
  });

  final _ChatMessage message;
  final void Function(_NormativeCitation) onCitationTap;

  @override
  Widget build(BuildContext context) {
    final isAgent = message.isAgent;

    return Align(
      alignment: isAgent ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.82,
        ),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isAgent ? AppColors.card : AppColors.blue600,
          borderRadius: BorderRadius.circular(16).copyWith(
            bottomLeft: isAgent ? const Radius.circular(4) : null,
            bottomRight: !isAgent ? const Radius.circular(4) : null,
          ),
          border: isAgent ? Border.all(color: AppColors.slate200) : null,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Agent label
            if (isAgent)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: AppColors.blue600.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Icon(Icons.smart_toy, size: 13, color: AppColors.blue600),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'MARK AI',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.blue600,
                      ),
                    ),
                    if (message.isStreaming) ...[
                      const SizedBox(width: 8),
                      const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 1.5,
                          color: AppColors.blue500,
                        ),
                      ),
                    ],
                  ],
                ),
              ),

            // Message text
            Text(
              message.text,
              style: TextStyle(
                fontSize: 14,
                color: isAgent ? AppColors.slate700 : Colors.white,
                height: 1.45,
              ),
            ),

            // Streaming cursor
            if (message.isStreaming)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Container(
                  width: 8,
                  height: 16,
                  color: AppColors.blue600.withValues(alpha: 0.6),
                ),
              ),

            // Normative citations
            if (isAgent && !message.isStreaming && message.citations.isNotEmpty) ...[
              const SizedBox(height: 10),
              const Divider(color: AppColors.slate200, height: 1),
              const SizedBox(height: 8),
              Text(
                'RESPALDO NORMATIVO',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.8,
                  color: AppColors.slate500,
                ),
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: message.citations.map((c) {
                  return Tooltip(
                    message: 'SHA-256: ${c.hashSha256.substring(0, 16)}…',
                    child: InkWell(
                      onTap: () => onCitationTap(c),
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.blue50,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.blue300.withValues(alpha: 0.5)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.gavel, size: 12, color: AppColors.blue600),
                            const SizedBox(width: 5),
                            Flexible(
                              child: Text(
                                c.label,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.blue600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],

            // No-citation warning
            if (isAgent &&
                !message.isStreaming &&
                message.citations.isEmpty &&
                message.id != 'greeting') ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.amber500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.amber500.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.warning_amber_rounded, size: 14, color: AppColors.amber600),
                    SizedBox(width: 5),
                    Flexible(
                      child: Text(
                        'Respuesta sin respaldo normativo — verificar con fuente oficial.',
                        style: TextStyle(fontSize: 11, color: AppColors.amber600),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Time + send status
            const SizedBox(height: 6),
            Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const Spacer(),
                Text(
                  message.time,
                  style: TextStyle(
                    fontSize: 10,
                    color: isAgent ? AppColors.slate400 : Colors.white70,
                  ),
                ),
                if (!isAgent && message.sendStatus != null) ...[
                  const SizedBox(width: 4),
                  _SendStatusIcon(status: message.sendStatus!),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Supporting widgets
// ---------------------------------------------------------------------------

class _SendStatusIcon extends StatelessWidget {
  const _SendStatusIcon({required this.status});

  final _SendStatus status;

  @override
  Widget build(BuildContext context) {
    return switch (status) {
      _SendStatus.sending => const SizedBox(
          width: 12,
          height: 12,
          child: CircularProgressIndicator(strokeWidth: 1.2, color: Colors.white70),
        ),
      _SendStatus.sent => const Icon(Icons.done_all, size: 14, color: Colors.white70),
      _SendStatus.error => const Icon(Icons.error_outline, size: 14, color: AppColors.red500),
    };
  }
}

class _VoiceButton extends StatelessWidget {
  const _VoiceButton({
    required this.isListening,
    required this.enabled,
    this.onPressed,
  });

  final bool isListening;
  final bool enabled;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isListening ? AppColors.red500.withValues(alpha: 0.12) : Colors.transparent,
      ),
      child: IconButton(
        icon: Icon(
          isListening ? Icons.mic : Icons.mic_outlined,
          color: isListening
              ? AppColors.red500
              : (enabled ? AppColors.slate500 : AppColors.slate400),
        ),
        onPressed: onPressed,
        tooltip: isListening ? 'Detener grabación' : 'Entrada por voz',
      ),
    );
  }
}

class _CitationDetailSheet extends StatelessWidget {
  const _CitationDetailSheet({required this.citation});

  final _NormativeCitation citation;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.slate200,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'REFERENCIA NORMATIVA',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.8,
              color: AppColors.slate500,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.gavel, size: 20, color: AppColors.blue600),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  citation.label,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.slate700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.bg,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.slate200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'HASH SHA-256',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                    color: AppColors.slate500,
                  ),
                ),
                const SizedBox(height: 4),
                SelectableText(
                  citation.hashSha256,
                  style: const TextStyle(
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: AppColors.slate600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: const Icon(Icons.open_in_new, size: 16),
              label: const Text('Ver en corpus normativo offline'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.blue600,
                side: const BorderSide(color: AppColors.blue600),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              onPressed: () {
                Navigator.pop(context);
                // TODO: navigate via go_router to /normas/${citation.normaId}
              },
            ),
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom + 8),
        ],
      ),
    );
  }
}
