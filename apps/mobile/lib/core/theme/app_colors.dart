import 'package:flutter/material.dart';

/// Design tokens from CLAUDE.md §"Paleta y estilo"
abstract final class AppColors {
  // Navy — sidebar / topbar
  static const navy900 = Color(0xFF1A2332);
  static const navy950 = Color(0xFF0F1E3D);

  // Blue — institutional primary
  static const blue900 = Color(0xFF1E3A8A);
  static const blue800 = Color(0xFF1E40AF);
  static const blue600 = Color(0xFF2563EB);
  static const blue500 = Color(0xFF3B82F6);
  static const blue300 = Color(0xFF93C5FD);
  static const blue50 = Color(0xFFEFF6FF);

  // Slate — text, borders
  static const slate200 = Color(0xFFE2E8F0);
  static const slate400 = Color(0xFF94A3B8);
  static const slate500 = Color(0xFF64748B);
  static const slate600 = Color(0xFF475569);
  static const slate700 = Color(0xFF334155);

  // Backgrounds
  static const bg = Color(0xFFF5F7FA);
  static const card = Color(0xFFFFFFFF);

  // Semantic
  static const green600 = Color(0xFF059669);
  static const red500 = Color(0xFFEF4444);
  static const amber500 = Color(0xFFF59E0B);
  static const amber600 = Color(0xFFD97706);

  // Dark theme overrides
  static const darkBg = Color(0xFF0F172A);
  static const darkCard = Color(0xFF1E293B);
  static const darkBorder = Color(0xFF334155);
}
