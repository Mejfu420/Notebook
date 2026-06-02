import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import styles from '@/styles/main.module.scss'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/notes')
  }

  return (
    <main className={styles.heroContainer}>

      <div className={styles.logoWrapper}>
        <div className={styles.logoIcon}>R</div>
        <div className={styles.logoBrand}>
          Red<span className={styles.highlight}>Notes</span>
        </div>
      </div>

      <p className={styles.catchyText}>
        Sync your mind to the cloud. A blazing fast, secure, and cloud-native space tailored for your daily notes and ideas.
      </p>

      <div className={styles.buttonGroup}>
        <SignInButton mode="modal" forceRedirectUrl="/notes">
          <button className={styles.btnSignIn}>
            Sign In
          </button>
        </SignInButton>

        <SignUpButton mode="modal" forceRedirectUrl="/notes">
          <button className={styles.btnSignUp}>
            Get Started
          </button>
        </SignUpButton>
      </div>

    </main>
  )
}