import React from 'react';
import styles from '@/styles/pages/dashboard/dashboard.module.css';

import { Users, CreditCard, BarChart3, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      {/* METRIC CARDS */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.blueIcon}`}>
              <Users size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.cardLabel}>Total Socios</p>
            <h2 className={styles.cardValue}>248</h2>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.purpleIcon}`}>
              <CreditCard size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.cardLabel}>Membresías Activas</p>
            <h2 className={styles.cardValue}>193</h2>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.cyanIcon}`}>
              <BarChart3 size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.cardLabel}>Ingresos del Mes</p>
            <h2 className={styles.cardValue}>$4.2M COP</h2>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.indigoIcon}`}>
              <TrendingDown size={22} color="#fff" />
            </div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.cardLabel}>Tasa de Deserción</p>
            <h2 className={styles.cardValue}>8%</h2>
          </div>
        </div>
      </div>

      {/* CHARTS & LISTS SECTION */}
      <div className={styles.contentGrid}>
        {/* ASISTENCIA SEMANAL */}
        <div className={`${styles.chartCard} glass`}>
          <h3 className={styles.sectionTitle}>Asistencia Semanal</h3>
          <div className={styles.barChart}>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: '70%' }}></div>
              <span className={styles.barLabel}>Lun</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: '85%' }}></div>
              <span className={styles.barLabel}>Mar</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: '75%' }}></div>
              <span className={styles.barLabel}>Mié</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: '90%' }}></div>
              <span className={styles.barLabel}>Jue</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: '95%' }}></div>
              <span className={styles.barLabel}>Vie</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: '50%' }}></div>
              <span className={styles.barLabel}>Sáb</span>
            </div>
            <div className={styles.barGroup}>
              <div className={styles.bar} style={{ height: '40%' }}></div>
              <span className={styles.barLabel}>Dom</span>
            </div>
          </div>
        </div>

        {/* MEMBRESÍAS POR VENCER */}
        <div className={`${styles.expiringCard} glass`}>
          <h3 className={styles.sectionTitle}>Membresías por Vencer</h3>
          <div className={styles.memberList}>
            <div className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <div className={`${styles.memberAvatar} ${styles.avatarPurple}`}>CM</div>
                <div>
                  <p className={styles.memberName}>Carlos Mendoza</p>
                  <span className={`${styles.tag} ${styles.tagPurple}`}>Premium</span>
                </div>
              </div>
              <span className={styles.timeLeft}>3d</span>
            </div>

            <div className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <div className={`${styles.memberAvatar} ${styles.avatarCyan}`}>AG</div>
                <div>
                  <p className={styles.memberName}>Ana García</p>
                  <span className={`${styles.tag} ${styles.tagCyan}`}>Básico</span>
                </div>
              </div>
              <span className={styles.timeLeft}>7d</span>
            </div>

            <div className={styles.memberItem}>
              <div className={styles.memberInfo}>
                <div className={`${styles.memberAvatar} ${styles.avatarBlue}`}>LR</div>
                <div>
                  <p className={styles.memberName}>Luis Ramírez</p>
                  <span className={`${styles.tag} ${styles.tagBlue}`}>VIP</span>
                </div>
              </div>
              <span className={styles.timeLeft}>10d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}